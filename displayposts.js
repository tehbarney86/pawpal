import { userData } from './userdata.js';
import { convertMarkdownToHTML } from './markdown.js';

const posts = [];
const ws = new WebSocket("wss://server.meower.org/?v=1");

// Fetch initial posts
fetch('https://api.meower.org/home')
  .then(response => response.json())
  .then(data => {
    posts.push(...data.autoget);
    updateTable();
  })
  .catch(error => console.error("Error fetching posts:", error));

// Decode HTML entities
function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// WebSocket message handling
ws.onmessage = event => {
  const data = JSON.parse(event.data);
  console.log("Received message:", data);

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
};

// Update the table with posts
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

    // Style cells
    userImageCell.style.width = '50px';
    contentCell.style.width = 'calc(100% - 50px)';
    userImageCell.style.padding = '5px';
    contentCell.style.padding = '5px';
    contentCell.style.wordWrap = 'break-word';
    contentCell.style.wordBreak = 'break-all';
    contentCell.style.whiteSpace = 'pre-wrap';

    // User avatar and info
    const avatarUrl = post.author.avatar ? `https://github.com/tehbarney86/meower95/blob/main/assets/pfps/${post.author._id}.png?raw=true` : 'https://github.com/tehbarney86/meower95/blob/main/assets/pfps/${post.author.pfp_data}.png?raw=true';
    const userColor = post.author.avatar_color || '#000';
    userImageCell.innerHTML = `
      <img src="${avatarUrl}" width="64" height="64" alt="Icon">
      <hr>
      <b><font color="${userColor}">${post.author._id}</font></b>
    `;

    // Fetch user info on hover
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

    // Post content
    const decodedContent = decodeHTML(post.p);
    contentCell.innerHTML = `${convertMarkdownToHTML(decodedContent)}<hr>${new Date(post.t.e * 1000)}`;
  });
}

// Update table when DOM is fully loaded
document.addEventListener('DOMContentLoaded', updateTable);
