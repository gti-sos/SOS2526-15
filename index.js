const express = require('express');
const cool = require('cool-ascii-faces');
const app = express();
const port = process.env.PORT || 8080; // Vital para que Render asigne el puerto correctamente

app.get('/cool', (req, res) => {
    res.send(cool());
});

const path = require('path');

// Sirve la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Enlaza la ruta /about directamente al html
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.listen(port, () => {
    console.log(`Server ready at port ${port}`);
});