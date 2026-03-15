import util from 'util';
util.isDate = util.types.isDate;
util.isRegExp = util.types.isRegExp;
util.isError = util.types.isNativeError;

import express from 'express';
import cool from 'cool-ascii-faces';

const app = express();
const port = process.env.PORT || 8080; 
import {loadBackendSMB} from './src/routes/SMB.js';
import {loadBackendYHX} from './src/routes/YHX.js';
import {loadBackendJAM} from './src/routes/JAM.js';

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