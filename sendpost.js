import { getUserData } from './userdata.js';

export function sendPost() {
    const postTextbox = document.getElementById('post-textbox');
    const postContent = postTextbox.value;
    console.log(postContent)
    
    const userData = getUserData();

    fetch('https://api.meower.org/home', {
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