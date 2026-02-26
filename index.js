const express = require('express');
const cool = require('cool-ascii-faces');
const app = express();
const port = process.env.PORT || 8080; 

app.use('/', express.static('public'));

app.get('/cool', (req, res) => {
    res.send(cool());
});

app.listen(port, () => {
    console.log(`Server ready at port ${port}`);
});