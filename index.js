import util from 'util';
util.isDate = util.types.isDate;
util.isRegExp = util.types.isRegExp;
util.isError = util.types.isNativeError;

import express from 'express';


const app = express();
const port = process.env.PORT || 8080; 
import {loadBackendSMB} from './src/routes/SMB.js';
import {loadBackendYHX} from './src/routes/YHX.js';
import {loadBackendJAM} from './src/routes/JAM.js';
//import {loadBackendJAM} from './src/routes/JAMv2.js';

app.use('/', express.static('public'));

app.use(express.json());


loadBackendSMB(app);
loadBackendYHX(app);
loadBackendJAM(app);

app.listen(port, () => {
    console.log(`Server ready at port ${port}`);
});
