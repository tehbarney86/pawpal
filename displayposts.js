import { userData } from './userdata.js';

const posts = [];
const ws = new WebSocket("wss://server.meower.org/?v=1");

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received message:", data);
  if (data.cmd === 'post') {
    posts.unshift(data.val);
    updateTable();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  updateTable();
});

function convertMarkdownToHTML(text) {
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // bold
  text = text.replace(/__(.*?)__/g, '<u>$1</u>'); // underline
  text = text.replace(/~~(.*?)~~/g, '<strike>$1</strike>'); // strikethrough
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>'); // italic
  text = text.replace(/\^\^(.*?)\^\^/g, '<marquee>$1</marquee>'); // marquee
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>'); // links
  text = text.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>'); // code blocks
  text = text.replace(/https?:\/\/[^\s]+/g, `<a href="$&">$&</a>`); // URLs
  return text;
}

function updateTable() {
  const table = document.getElementById("post-table");
  if (!table) {
    console.error("Table element not found");
    return;
  }

  table.innerHTML = '';

  posts.forEach(post => {
    const row1 = table.insertRow();
    const iconCell = row1.insertCell();
    const contentCell = row1.insertCell();

    iconCell.innerHTML = `<img src="https://uploads.meower.org/icons/${post.author.avatar}" width="50" height="50" alt="Icon">`
    const sanitizedContent = DOMPurify.sanitize(post.p, {
      ALLOWED_TAGS: ['b', 'i', 'u', 'em', 'strong', 'a', 'img', 'src', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'title', 'alt', 'style', 'width', 'height'],
    });

    const icon = iconCell.querySelector('img')

    icon.addEventListener('mouseover', async () => {
      icon.style.cursor = 'help';
      try {
          let userInfo = await userData(post.author._id);
          console.log(userInfo);
          icon.title = `User: ${userInfo._id}\nBio: ${userInfo.quote}\nDate Joined: ${new Date(userInfo.created * 1000)}`;
      } catch (error) {
          console.error("Error fetching user data:", error); 
          icon.title = "User info not available"; 
      }
    });  

    icon.addEventListener('mouseout', () => {
        icon.style.cursor = 'pointer';
    });
    
    contentCell.innerHTML = sanitizedContent;
    contentCell.innerHTML = convertMarkdownToHTML(contentCell.innerHTML);
  
    contentCell.style.wordWrap = 'break-word';
    contentCell.style.wordBreak = 'break-all';
    contentCell.style.whiteSpace = 'pre-wrap';
    
    const row2 = table.insertRow();
    const authorCell = row2.insertCell();
    const dateCell = row2.insertCell();

    authorCell.innerHTML = `User: <b>${post.author._id}</b>`;
    dateCell.innerHTML = new Date(post.t.e * 1000)

    table.insertRow();
  });

}