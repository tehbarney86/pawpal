import { userData } from './userdata.js';
import { convertMarkdownToHTML } from './markdown.js';

const posts = [];
const ws = new WebSocket("wss://server.meower.org/?v=1");

fetch('https://api.meower.org/home').then(response => response.json()).then(data => {
  posts.push(...data.autoget);
  updateTable(); // Initial table population
});

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log("Received message:", data);
  if (data.cmd === 'post') {
    posts.unshift(data.val);
    updateTable(); // Update table for new posts
  } else if (data.cmd === 'update_post') {
    const index = posts.findIndex(post => post._id === data.val._id);
    if (index !== -1) {
      posts[index] = data.val;
      updateTable(); // Update table with modified posts
    }
  } else if (data.cmd === 'delete_post') {
    const index = posts.findIndex(post => post._id === data.val._id);
    if (index !== -1) {
      posts.splice(index, 1);
      updateTable(); // Update table after deleting posts
    }
  }
};

document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    updateTable();
  }
};

function updateTable() {
  const table = document.getElementById("post-table");
  if (!table) {
    console.error("Table element not found");
    return;
  }

  // Clear existing rows
  table.innerHTML = '';

  posts.forEach((post) => {
    const row = table.insertRow();
    const userImageCell = row.insertCell();
    const contentCell = row.insertCell();

    const cellWidth = '50px';
    userImageCell.style.width = cellWidth;
    contentCell.style.width = `calc(100% - ${cellWidth})`;

    userImageCell.innerHTML = `
      <img src="${post.author.avatar ? 'https://uploads.meower.org/icons/' + post.author.avatar : 'defaultpfp.png'}" width="50" height="50" alt="Icon">
      <hr>
      <div><font color="${post.author.avatar_color}">${post.author._id}</font></div>
    `;

    const sanitizedContent = DOMPurify.sanitize(post.p);
    const icon = userImageCell.querySelector('img');

    icon.addEventListener('mouseover', async () => {
      icon.style.cursor = 'help';
      try {
        if (!icon.title) {
          const userInfo = await userData(post.author._id);
          icon.title = `User: ${userInfo._id}\nBio: ${userInfo.quote}\nDate Joined: ${new Date(userInfo.created * 1000)}`;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        icon.title = "User info not available";
      }
    });

    icon.addEventListener('mouseout', () => {
      icon.style.cursor = 'pointer';
    });

    contentCell.innerHTML = convertMarkdownToHTML(sanitizedContent) + '<hr>' + new Date(post.t.e * 1000);
    contentCell.style.wordWrap = 'break-word';
    contentCell.style.wordBreak = 'break-all';
    contentCell.style.whiteSpace = 'pre-wrap';
    userImageCell.style.padding = '5px';
    contentCell.style.padding = '5px';
  });
}