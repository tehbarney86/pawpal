export const userData = async (user) => fetch(`https://api.meower.org/users/${user}`).then(async response => {
    if (response.ok) {
        return await response.json();
    } else {
        throw new Error('Network response was not ok');
    }
});