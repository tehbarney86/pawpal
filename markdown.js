const emojiImages = {
  '🍈': '/public/img/emojis/emoji_melon.png',
  '🙂': '/public/img/emojis/emoji_smile.png',
  '😎': '/public/img/emojis/emoji_cool.png',
  '🤓': '/public/img/emojis/emoji_nerd.png',
  '😡': '/public/img/emojis/emoji_angry.png',
};

function parseTable(text) {
  // Regex to match Markdown tables with headers, alignment, and rows
  const markdownTableRegex = /(?<=\n|^)\|(.+?)\|\n\|([-:| ]+)\|\n((?:\|(.+?)\|\n?)*)\n?(?=\n|$)/gs;

  // Convert Markdown table to HTML table
  text = text.replace(markdownTableRegex, (match, headers, alignment, rows) => {
    let table = '<table border="1" cellpadding="2" cellspacing="2">';

    // Process headers
    if (headers) {
      const headerRows = headers.split('\n').filter(row => row.trim());
      table += '<thead>';
      headerRows.forEach(headerRow => {
        const headerCells = headerRow.split('|').filter(cell => cell.trim()).map(cell => `<th>${cell.trim()}</th>`).join('');
        table += `<tr>${headerCells}</tr>`;
      });
      table += '</thead>';
    }

    // Process rows
    if (rows) {
      table += '<tbody>';
      const rowLines = rows.split('\n').filter(row => row.trim());
      rowLines.forEach(rowLine => {
        const rowCells = rowLine.split('|').filter(cell => cell.trim()).map(cell => `<td>${cell.trim()}</td>`).join('');
        table += `<tr>${rowCells}</tr>`;
      });
      table += '</tbody>';
    }

    table += '</table>';
    return table;
  });

  // Regex to match ASCII tables
  const asciiTableRegex = /\+.*?\+\n(?:\|.*?\|\n)+\+.*?\+/gs;

  text = text.replace(asciiTableRegex, (match) => {
    let lines = match.split('\n').filter(line => line.trim());
    let table = '<table border="1" cellpadding="2" cellspacing="2">';

    // Headers
    let headers = lines[1].slice(1, -1).split('|').map(cell => `<th>${cell.trim()}</th>`).join('');
    table += `<thead><tr>${headers}</tr></thead>`;

    // Rows
    lines.slice(2, -1).forEach(line => {
      let cells = line.slice(1, -1).split('|').map(cell => `<td>${cell.trim()}</td>`).join('');
      table += `<tr>${cells}</tr>`;
    });

    table += '</tbody></table>';
    return table;
  });

  return text;
}

export function convertMarkdownToHTML(text) {
  // Markdown to HTML
  text = text
    .replace(/(?<!\\)\*\*(.*?)\*\*/g, '<strong>$1</strong>') // bold
    .replace(/(?<!\\)__(.*?)__/g, '<u>$1</u>') // underline
    .replace(/(?<!\\)~~(.*?)~~/g, '<strike>$1</strike>') // strikethrough
    .replace(/(?<!\\)\*(.*?)\*/g, '<em>$1</em>') // italic
    .replace(/(?<!\\)\^\^(.*?)\^\^/g, '<marquee>$1</marquee>') // marquee
    .replace(/(?<!\\)\[(.*?)\]\((.*?)\)/g, (match, text, url) => `<a href="${url}">${text}</a>`) // links
    .replace(/^(?<!\\)> (.*)/gm, '<blockquote>$1</blockquote>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>') // code blocks
    .replace(/🌈(.*?)🌈/g, '<rainbow>$1</rainbow>') // rainbow text
    .replace(/(?<!\\)\*\*(.*?)\*\*/g, '<span class="trashy-filter">$1</span>') // trashy filter
  text = text
    .replace(/\\([*_~\[\]()^`])/g, '$1')
    .replace(/\\([^\s\S])/g, '$1');


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
      return `<img class="emoji" src="https://cdn.discordapp.com/emojis/${id}.${ext}?size=128&quality=lossless" alt="${name}">`;
    }); // Discord emojis

  // Meower Emoji 
  text = text.replace(/<:(\w+)>/g, (match, id) => {
    return `<img class="emoji" src="https://uploads.meower.org/emojis/${id}" alt="Meower Emoji">`;
  });

  // Replace custom emojis
  text = text.replace(/([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2300}-\u{23FF}\u{2B50}\u{1F004}-\u{1F0CF}])/gu, match => {
    return emojiImages[match] ? `<img src="${emojiImages[match]}" alt="${match}" class="emoji" id="default-emoji">` : match;
  });  

  // Tables
  text = parseTable(text);

  return text;
}