export function convertMarkdownToHTML(text) {
  // Markdown to HTML
  text = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // bold
    .replace(/__(.*?)__/g, '<u>$1</u>') // underline
    .replace(/~~(.*?)~~/g, '<strike>$1</strike>') // strikethrough
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // italic
    .replace(/\^\^(.*?)\^\^/g, '<marquee>$1</marquee>') // marquee
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>') // links
    .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>') // code blocks
    .replace(/🌈(.*?)🌈/g, '<rainbow>$1</rainbow>'); // rainbow text

  // BBCode to HTML
  text = text
    .replace(/\[b](.*?)\[\/b]/g, '<strong>$1</strong>') // bold
    .replace(/\[u](.*?)\[\/u]/g, '<u>$1</u>') // underline
    .replace(/\[s](.*?)\[\/s]/g, '<strike>$1</strike>') // strikethrough
    .replace(/\[i](.*?)\[\/i]/g, '<em>$1</em>') // italic
    .replace(/\[marquee](.*?)\[\/marquee]/g, '<marquee>$1</marquee>') // marquee
    .replace(/\[url=(.*?)](.*?)\[\/url]/g, '<a href="$1">$2</a>') // links
    .replace(/\[code](.*?)\[\/code]/gs, '<pre><code>$1</code></pre>') // code blocks
    .replace(/\[rainbow](.*?)\[\/rainbow]/g, '<rainbow>$1</rainbow>') // rainbow text
    .replace(/\[img](.*?)\[\/img]/g, '<img src="$1" />') // images
    .replace(/\[size=(.*?)\](.*?)\[\/size]/g, '<span style="font-size: $1;">$2</span>') // font size
    .replace(/\[color=(.*?)\](.*?)\[\/color]/g, '<span style="color: $1;">$2</span>') // color
    .replace(/\[center](.*?)\[\/center]/g, '<center>$1</center>') // center
    .replace(/\[left](.*?)\[\/left]/g, '<p align="left">$1</p>') // left align
    .replace(/\[right](.*?)\[\/right]/g, '<p align="right">$1</p>') // right align
    .replace(/\[quote\](.*?)\[\/quote]/g, '<blockquote>$1</blockquote>') // quote
    .replace(/\[list]((?:\[\*].*?)+)\[\/list]/g, '<ul>$1</ul>') // unordered list
    .replace(/\[\*](.*?)/g, '<li>$1</li>') // list items
    .replace(/\[olist]((?:\[\*].*?)+)\[\/olist]/g, '<ol>$1</ol>') // ordered list
    .replace(/\[h([1-6])](.*?)\[\/h\1]/g, '<h$1>$2</h$1>') // headers
    .replace(/\[hr\]/g, '<hr>'); // horizontal rule

  // URLs and Discord Emoji Handling
  text = text
    .replace(/([a-z]+:\/\/[^\s]+)/g, match => `<a href="${match}">${match}</a>`) // URLs
    .replace(/<(a)?:(\w+):(\d+)>/gi, (match, a, name, id) => {
      const ext = a ? 'gif' : 'webp'; 
      return `<img src="https://cdn.discordapp.com/emojis/${id}.${ext}?size=128&quality=lossless" alt="${name}">`;
    }); // Discord emojis

  // Tables
  text = text.replace(/(?:\|(.+?)\|)\n(?:\|[-:]+[-|:]+\|)\n((?:\|.*\|\n?)*)/g, (headers, rows) => {
    let table = '<table border="1" cellpadding="2" cellspacing="2">';

    const headerCells = headers.split('|').filter(cell => cell.trim()).map(cell => `<td>${cell.trim()}</td>`).join('');
    table += '<tr>' + headerCells + '</tr>';

    rows.split('\n').filter(row => row.trim()).forEach(line => {
      const cells = line.split('|').filter(cell => cell.trim()).map(cell => `<td>${cell.trim()}</td>`).join('');
      table += '<tr>' + cells + '</tr>';
    });

    table += '</table>';
    return table;
  });

  return text;
}