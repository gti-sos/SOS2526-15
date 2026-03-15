import express from 'express';
import cool from 'cool-ascii-faces';

const app = express();
const port = process.env.PORT || 8080; 
import {loadBackendSMB} from './src/routes/SMB.js';
import {loadBackendYHX} from './src/routes/YHX.js';
import {loadBackendYHX} from './src/routes/JAM.js';

app.use('/', express.static('public'));

app.use(express.json());


loadBackendSMB(app);
loadBackendYHX(app);
loadBackendJAM(app);

app.listen(port, () => {
    console.log(`Server ready at port ${port}`);
});

app.get('/cool', (req, res) => {
    res.send(cool());
});