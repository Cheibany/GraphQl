//TODO handle les accents pour le password
function customBtoa(input) { // funtion qui gére les accents 
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(input);
    let binaryString = '';
    uint8Array.forEach(byte => {
        binaryString += String.fromCharCode(byte);
    });
    return btoa(binaryString);
}
document.getElementById('loginButton').addEventListener('click', async function (event) {
    event.preventDefault(); // Prevent form submission

    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    const credentials = customBtoa(`${username}:${password}`);

    try {
        const response = await fetch('https://learn.zone01dakar.sn/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error('Invalid credentials');
        }

        const jwt = await response.json();
        localStorage.setItem('jwt', jwt);
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);

        // Vérifier si le jeton JWT est bien stocké dans le localStorage
        const storedToken = localStorage.getItem('jwt');
        if (storedToken === jwt) {
            console.log('Le jeton JWT a été correctement stocké dans le localStorage.');
        } else {
            console.log('Le jeton JWT n\'a pas été correctement stocké dans le localStorage.');
        }
        window.location.href = 'index.html';
    } catch (error) {
        document.getElementById('errorMessage').textContent = error.message;
    }
});

//cisall   