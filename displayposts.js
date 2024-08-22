import { getUserData, userData } from './userdata.js';
import { convertMarkdownToHTML } from './markdown.js';

let currentContext = 'home';
let currentChatID = '';

export function displayPosts(context = currentContext, chatID = currentChatID) {
  currentContext = context;
  currentChatID = chatID;

  let posts = [];

  const data = getUserData();
  const ws = new WebSocket(`wss://server.meower.org/?v=1&token=${data.token}`);

  const headers = data.token ? { "Token": data.token } : {};
  const url = context === "groupchats" && chatID
    ? `https://api.meower.org/posts/${chatID}?page=${1}`
    : `https://api.meower.org/home
?page=${1}`;

  if (currentContext === "livechat") {
    posts = [];
    updateTable();

  } else {
    fetch(url, { headers })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        posts.push(...data.autoget);
        updateTable();
      })
      .catch(error => console.error("Error fetching posts:", error));
  }

  function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  ws.onmessage = event => {
    const data = JSON.parse(event.data);
    console.log("Received message:", data);

    if ((currentContext === "livechat" && data.val.post_origin === "livechat") || (data.val.post_origin === currentChatID && currentContext === "groupchats") || (currentContext === "home" && data.val.post_origin === currentContext)) {
      switch (data.cmd) {
        case 'post':
          posts.unshift(data.val);
          break;
        case 'update_post':
          const updateIndex = posts.findIndex(post => post._id === data.val._id);
          if (updateIndex !== -1) posts[updateIndex] = data.val;
          break;
        case 'delete_post':
          const deleteIndex = posts.findIndex(post => post._id === data.val._id);
          if (deleteIndex !== -1) posts.splice(deleteIndex, 1);
          break;
        default:
          console.warn("Unknown command:", data.cmd);
      }
      updateTable();
    }
  };

  function updateTable() {
    const table = document.getElementById("post-table");
    if (!table) {
      console.error("Table element not found");
      return;
    }

    table.innerHTML = '';

    posts.forEach(post => {
      const row = table.insertRow();
      const userImageCell = row.insertCell();
      const contentCell = row.insertCell();

      Object.assign(userImageCell.style, {
        width: '50px',
        padding: '5px',
      });

      Object.assign(contentCell.style, {
        width: 'calc(100% - 50px)',
        wordWrap: 'break-word',
        wordBreak: 'break-all',
        whiteSpace: 'pre-wrap'
      });

      const avatarUrl = post.author.avatar ? `https://uploads.meower.org/icons/${post.author.avatar}` : '/public/img/defaultpfp.png';
      const userColor = post.author.avatar_color || '#000';
      userImageCell.innerHTML = `
      <img src="${avatarUrl}" style="width: 50px; height: 50px; object-fit: cover;" alt="Icon">
      <hr>
      <b><span style="color: ${userColor};">${post.author._id}</span></b>
    `;

      const icon = userImageCell.querySelector('img');
      icon.addEventListener('mouseover', async () => {
        icon.style.cursor = 'help';
        if (!icon.title) {
          try {
            const userInfo = await userData(post.author._id);
            icon.title = `User: ${userInfo._id}\nBio: ${userInfo.quote}\nDate Joined: ${new Date(userInfo.created * 1000)}`;
          } catch (error) {
            console.error("Error fetching user data:", error);
            icon.title = "User info not available";
          }
        }
      });
      icon.addEventListener('mouseout', () => icon.style.cursor = 'pointer');

      let postReplies = post.reply_to.map(reply => {
        const replyUserColor = reply?.author.avatar_color || '#000';
        return `<blockquote id="reply"><table border="1" cellpadding="0" cellspacing="0" width="100%"><tr><td><b><font color="${replyUserColor}">${reply?.author._id}</font> said:</b></td></tr><tr><td><div style="word-wrap: break-word; word-break: break-all; max-width: 100%; white-space: pre-wrap;">${reply?.p}
      </div></td></tr></table></blockquote>`;
      }).join('');

      let attachments = post.attachments.map(attachment => {
        return `\n <img src='https://uploads.meower.org/attachments/${attachment.id}' width='${attachment.width}' height='${attachment.height}' alt='Attachment' style='max-width: 256px; max-height: auto; object-fit: contain; align-self: center;'>`;
      }).join(`\n`)

      postReplies += '<br>';
      postReplies = convertMarkdownToHTML(decodeHTML(postReplies));

      let decodedContent = DOMPurify.sanitize(post.p, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      });
      decodedContent = decodeHTML(decodedContent);

      contentCell.innerHTML = `${postReplies} ${convertMarkdownToHTML(decodedContent)} ${attachments}<hr>${new Date(post.t.e * 1000)}
    <div style="text-align: right;"><button>Reply</button></div>`;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const channelSelect = document.getElementById('channel-select');
  const currentChat = channelSelect.value;

  if (currentChat === 'home') {
    sendPost("home", '');
  } else
    if (currentChat === 'livechat') {
      sendPost("livechat", 'livechat');
    } else {
      sendPost("groupchats", currentChat);
    }
});