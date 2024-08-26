export const userData = async (user) => fetch(`https://api.meower.org/users/${user}`).then(async response => {
    if (response.ok) {
        return await response.json();
    } else {
        throw new Error('Network response was not ok');
    }
});

export function getUserData() {
    let userDataString = localStorage.getItem("userData");
    if (!userDataString) {
      userDataString = sessionStorage.getItem("userData");
    }
    return userDataString ? JSON.parse(userDataString) : null;
  }
  