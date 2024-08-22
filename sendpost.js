import { getUserData } from './userdata.js';

export function sendPost(context, chatID) {
  const postTextbox = document.getElementById('post-textbox');
  const postContent = postTextbox.value;

  if (postContent.trim() === "") { 
    return;
  }

  const userData = getUserData();
  const url = context === "home" ? "https://api.meower.org/home" : `https://api.meower.org/posts/${chatID}`

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Token': userData.token
    },
    body: JSON.stringify({ content: postContent })
  })
    .then(response => response.json())
    .then(data => {
      console.log('Post successful:', data);
      postTextbox.value = '';
    })
    .catch(error => console.error('Error posting:', error));
}