export function convertMarkdownToHTML(text) {
  /* Icky Markdown */
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // bold
  text = text.replace(/__(.*?)__/g, '<u>$1</u>'); // underline
  text = text.replace(/~~(.*?)~~/g, '<strike>$1</strike>'); // strikethrough
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>'); // italic
  text = text.replace(/\^\^(.*?)\^\^/g, '<marquee>$1</marquee>'); // marquee
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>'); // links
  text = text.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>'); // code blocks
  text = text.replace(/🌈(.*?)🌈/g, '<rainbow>$1</rainbow>'); // rainbow text

  /* Gigachad BBCode */
  text = text.replace(/\[b](.*?)\[\/b]/g, '<strong>$1</strong>'); // bold
  text = text.replace(/\[u](.*?)\[\/u]/g, '<u>$1</u>'); // underline
  text = text.replace(/\[s](.*?)\[\/s]/g, '<strike>$1</strike>'); // strikethrough
  text = text.replace(/\[i](.*?)\[\/i]/g, '<em>$1</em>'); // italic
  text = text.replace(/\[marquee](.*?)\[\/marquee]/g, '<marquee>$1</marquee>'); // marquee
  text = text.replace(/\[url=(.*?)](.*?)\[\/url]/g, '<a href="$1">$2</a>'); // links
  text = text.replace(/\[code](.*?)\[\/code]/gs, '<pre><code>$1</code></pre>'); // code blocks
  text = text.replace(/\[rainbow](.*?)\[\/rainbow]/g, '<rainbow>$1</rainbow>'); // rainbow text
  text = text.replace(/\[img](.*?)\[\/img]/g, '<img src="$1" />'); // images - fixed!
  text = text.replace(/\[size=(.*?)\](.*?)\[\/size]/g, '<span style="font-size: $1;">$2</span>');
  text = text.replace(/\[color=(.*?)\](.*?)\[\/color]/g, '<span style="color: $1;">$2</span>');
  text = text.replace(/\[center](.*?)\[\/center]/g, '<center>$1</center>');
  text = text.replace(/\[left](.*?)\[\/left]/g, '<p align="left">$1</p>');
  text = text.replace(/\[right](.*?)\[\/right]/g, '<p align="right">$1</p>');
  text = text.replace(/\[quote\](.*?)\[\/quote]/g, '<blockquote>$1</blockquote>');


  text = text.replace(/https?:\/\/[^\s]+/g, (match) => `<a href="${match}">${match}</a>`); // URLs

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

  return text;
}