const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'web')));

// Route pour le fichier login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'login.html'));
});

// Route pour le fichier index.html
app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Server is running on  http://localhost:${PORT}`);
});
