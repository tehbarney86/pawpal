function getUserData() {
    let userDataString = localStorage.getItem("userData");
    if (!userDataString) {
      userDataString = sessionStorage.getItem("userData");
    }
    return userDataString ? JSON.parse(userDataString) : null;
}

function fetchUserList() {
fetch('https://api.meower.org/ulist')
    .then(response => response.json())
    .then(data => {
        const uList = document.getElementById('online-userlist');
        uList.innerHTML = '';
        
        const row = uList.insertRow();
        const cell = row.insertCell();
        cell.innerHTML = `${data.autoget.length} Online Users:`
        cell.colSpan = 2;
        cell.style.textAlign = 'center';
        cell.style.fontWeight = 'bold';
        cell.style.color = '#000000';
        cell.style.padding = '5px';

        data.autoget.forEach(user => {
            const row = uList.insertRow();
            const cell = row.insertCell();
            const avatarUrl = user.avatar ? `https://uploads.meower.org/icons/${user.avatar}` : '/public/img/defaultpfp.png';
            cell.innerHTML = `<img src=${avatarUrl} style="width: 15px; height: 15px; object-fit: cover;" alt="Icon"/>`
            
            const userData = getUserData()
            const you = userData.account._id

            if (you === user._id) {
                cell.innerHTML += `   ${user._id} <------- You`;
            } else {
                cell.innerHTML += `   ${user._id}`;
            }
        });
    })
    .catch(error => console.error("Error fetching online user list:", error));
}

fetchUserList();
setInterval(fetchUserList, 5000);