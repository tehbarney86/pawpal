import { userData } from './userdata.js';
import { convertMarkdownToHTML } from './markdown.js';

const posts = [];
const ws = new WebSocket("wss://server.meower.org/?v=1");

fetch('https://api.meower.org/home').then(response => response.json()).then(data => {
  posts.push(...data.autoget);
  updateTable();
});

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log("Received message:", data);
  if (data.cmd === 'post') {
    posts.unshift(data.val);
    updateTable();
  } else if (data.cmd === 'update_post') {
    const index = posts.findIndex(post => post._id === data.val._id);
    if (index !== -1) {
      posts[index] = data.val;
      updateTable();
    } else if (data.cmd === 'delete_post') {
      const index = posts.findIndex(post => post._id === data.val._id);
      if (index !== -1) {
        posts.splice(index, 1);
        updateTable();
      }
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

  table.innerHTML = '';

  posts.forEach(function(post) {
    const row1 = table.insertRow();
    const userImageCell = row1.insertCell();
    const contentCell = row1.insertCell();

    const cellWidth = '50px';
    userImageCell.style.width = cellWidth;
    contentCell.style.width = 'calc(100% - ' + cellWidth + ')';

    userImageCell.innerHTML = `
        <img src="https://uploads.meower.org/icons/${post.author.avatar}" width="50" height="50" alt="Icon"></img>
        <hr>
        <div><b>${post.author._id}</b></div>
    `;

    const sanitizedContent = DOMPurify.sanitize(post.p);
    const icon = userImageCell.querySelector('img')

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

    contentCell.innerHTML = sanitizedContent + ' <hr>' + new Date(post.t.e * 1000);
    contentCell.innerHTML = convertMarkdownToHTML(contentCell.innerHTML);

    contentCell.style.wordWrap = 'break-word';
    contentCell.style.wordBreak = 'break-all';
    contentCell.style.whiteSpace = 'pre-wrap';
    userImageCell.style.padding = '5px';
    contentCell.style.padding = '5px';
});
}