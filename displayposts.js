import { userData } from './userdata.js';

const posts = [];
const ws = new WebSocket("wss://server.meower.org/?v=1");

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
        posts.pop(index);
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

function convertMarkdownToHTML(text) {
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // bold
  text = text.replace(/__(.*?)__/g, '<u>$1</u>'); // underline
  text = text.replace(/~~(.*?)~~/g, '<strike>$1</strike>'); // strikethrough
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>'); // italic
  text = text.replace(/\^\^(.*?)\^\^/g, '<marquee>$1</marquee>'); // marquee
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>'); // links
  text = text.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>'); // code blocks
  text = text.replace(/https?:\/\/[^\s]+/g, '<a href="$&">$&</a>'); // URLs

  text = text.replace(/(?:\|(.+?)\|)\n(?:\|[-:]+[-|:]+\|)\n((?:\|.*\|\n?)*)/g, function (headers, rows) {
    let table = '<table border="1" cellpadding="2" cellspacing="2">';
    
    const headerCells = headers.split('|').filter(cell => cell.trim() !== '').map(cell => `<td>${cell.trim()}</td>`).join('');
    table += '<tr>' + headerCells + '</tr>';

    const rowLines = rows.split('\n').filter(row => row.trim() !== '');
    rowLines.forEach(function (line) {
      const cells = line.split('|').filter(cell => cell.trim() !== '').map(cell => `<td>${cell.trim()}</td>`).join('');
      table += '<tr>' + cells + '</tr>';
    });

    table += '</table>';
    return table;
  });

  text = text.replace(/🌈(.*?)🌈/g, '<rainbow>$1</rainbow>'); // rainbow text
  return text;
}

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
        <img src="https://uploads.meower.org/icons/${post.author.avatar}" width="50" height="50" alt="Icon">
        <center><b>${post.author._id}</b></center>
    `;

    const sanitizedContent = DOMPurify.sanitize(post.p, {
        ALLOWED_TAGS: ['b', 'i', 'u', 'em', 'strong', 'a', 'img', 'p', 'br', 'marquee', 'rainbow'],
        ALLOWED_ATTR: ['href', 'title', 'alt', 'width', 'height'],
    });

    contentCell.innerHTML = sanitizedContent + '<hr>' + new Date(post.t.e * 1000);
    contentCell.innerHTML = convertMarkdownToHTML(contentCell.innerHTML);

    contentCell.style.wordWrap = 'break-word';
    contentCell.style.wordBreak = 'break-all';
    contentCell.style.whiteSpace = 'pre-wrap';
    userImageCell.style.padding = '5px';
    contentCell.style.padding = '5px';
});

}