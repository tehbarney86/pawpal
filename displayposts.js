import { getUserData, userData } from './userdata.js';
import { convertMarkdownToHTML } from './markdown.js';

var currentContext = 'home';
var currentChatID = '';
var posts = [];
var ws = null;

export function displayPosts(context, chatID) {
  if (typeof context === 'undefined') context = currentContext;
  if (typeof chatID === 'undefined') chatID = currentChatID;
  posts = [];


  currentContext = context;
  currentChatID = chatID;

  var data = getUserData();
  if (ws) {
    ws.close();
  }
  ws = new WebSocket('wss://server.meower.org/?v=1&token=' + data.token);

  var url = context === 'groupchats' && chatID
    ? 'https://api.meower.org/posts/' + chatID + '?page=1'
    : 'https://api.meower.org/home?page=1';

  if (currentContext === 'livechat') {
    posts = [];
    updateTable();
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    if (data.token) {
      xhr.setRequestHeader('Token', data.token);
    }
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        var responseData = JSON.parse(xhr.responseText);
        posts.push.apply(posts, responseData.autoget);
        updateTable();
      } else {
        console.error('Network response was not ok');
      }
    };
    xhr.onerror = function() {
      console.error('Error fetching posts:', xhr.statusText);
    };
    xhr.send();
  }

  function decodeHTML(html) {
    var txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  ws.onmessage = function(event) {
    var data = JSON.parse(event.data);
    console.log('Received message:', data);

    if ((currentContext === 'livechat' && data.val.post_origin === 'livechat') ||
        (currentContext === 'groupchats' && data.val.post_origin === currentChatID) ||
        (currentContext === 'home' && data.val.post_origin === 'home')) {
      switch (data.cmd) {
        case 'post':
          posts.unshift(data.val);
          break;
        case 'update_post':
          var updateIndex = findIndex(posts, function(post) { return post._id === data.val._id; });
          if (updateIndex !== -1) posts[updateIndex] = data.val;
          break;
        case 'delete_post':
          console.log('Attempting to delete post with ID:', data.val.post_id);
          var deleteIndex = findIndex(posts, function(post) { return post._id === data.val.post_id; });
          if (deleteIndex !== -1) {
            posts.splice(deleteIndex, 1);
            console.log('Post deleted successfully.');
          } else {
            console.warn('Post to delete not found.');
          }
          break;
        default:
          console.warn('Unknown command:', data.cmd);
      }
      updateTable();
    }
};

  function findIndex(array, predicate) {
    for (var i = 0; i < array.length; i++) {
      if (predicate(array[i])) return i;
    }
    return -1;
  }

  function updateTable() {
    var table = document.getElementById('post-table');
    if (!table) {
      console.error('Table element not found');
      return;
    }

    table.innerHTML = '';

    posts.forEach(function(post) {
      var row = table.insertRow();
      var userImageCell = row.insertCell();
      var contentCell = row.insertCell();

      userImageCell.style.width = '50px';
      userImageCell.style.padding = '5px';

      contentCell.style.width = 'calc(100% - 50px)';
      contentCell.style.wordWrap = 'break-word';
      contentCell.style.wordBreak = 'break-all';
      contentCell.style.whiteSpace = 'pre-wrap';

      var avatarUrl = post.author.avatar ? 'https://uploads.meower.org/icons/' + post.author.avatar : '/public/img/defaultpfp.png';
      var userColor = post.author.avatar_color || '#000';
      userImageCell.innerHTML = '<img src="' + avatarUrl + '" style="width: 50px; height: 50px; object-fit: cover;" alt="Icon"><hr><b><span style="color: ' + userColor + ';">' + post.author._id + '</span></b>';

      var icon = userImageCell.querySelector('img');
      icon.addEventListener('mouseover', function() {
        icon.style.cursor = 'help';
        if (!icon.title) {
          userData(post.author._id)
            .then(function(userInfo) {
              icon.title = 'User: ' + userInfo._id + '\nBio: ' + userInfo.quote + '\nDate Joined: ' + new Date(userInfo.created * 1000);
            })
            .catch(function(error) {
              console.error('Error fetching user data:', error);
              icon.title = 'User info not available';
            });
        }
      });
      icon.addEventListener('mouseout', function() { icon.style.cursor = 'pointer'; });

      var reply_to_attachments = post.reply_to.map(function(reply) {
        return reply.attachments.map(function(attachment) {
          return '\n <img src="https://uploads.meower.org/attachments/' + attachment.id + '" alt="Attachment" style="max-width: 256px; max-height: auto; object-fit: scale-down; align-self: center;">';
        }).join('\n');
      }).join('\n');

      var postReplies = post.reply_to.map(function(reply) {
        var replyUserColor = reply && reply.author.avatar_color || '#000';
        return '<blockquote id="reply"><table border="1" cellpadding="0" cellspacing="0" width="100%"><tr><td><b><font color="' + replyUserColor + '">' + (reply && reply.author._id || '') + ' said:</font></b></td></tr><tr><td><div style="word-wrap: break-word; word-break: break-all; max-width: 100%; white-space: pre-wrap;">' + (reply && convertMarkdownToHTML(decodeHTML(reply.p)) || '') + (reply_to_attachments ? reply_to_attachments + '\n' : '') + '</div></td></tr></table></blockquote>';
      }).join('');


      var attachments = post.attachments.map(function(attachment) {
        return '\n <img src="https://uploads.meower.org/attachments/' + attachment.id + '" alt="Attachment" style="max-width: 256px; max-height: auto; object-fit: scale-down; align-self: center;"></img>';
      }).join('\n');

      postReplies += '<br>';
      postReplies = DOMPurify.sanitize(postReplies);

      var decodedContent = DOMPurify.sanitize(post.p, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
      decodedContent = decodeHTML(decodedContent);

      contentCell.innerHTML = postReplies + convertMarkdownToHTML(decodeHTML(decodedContent)) + ' ' + attachments + '<hr>' + new Date(post.t.e * 1000) + '<div style="text-align: right;"><button>Reply</button></div>';
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var channelSelect = document.getElementById('channel-select');
  var currentChat = channelSelect.value;

  if (currentChat === 'home') {
    sendPost('home', '');
  } else if (currentChat === 'livechat') {
    sendPost('livechat', 'livechat');
  } else {
    sendPost('groupchats', currentChat);
  }
});