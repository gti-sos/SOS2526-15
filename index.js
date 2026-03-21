import util from 'util';
util.isDate = util.types.isDate;
util.isRegExp = util.types.isRegExp;
util.isError = util.types.isNativeError;
//import cors from 'cors';
import express from 'express';
//import {handler} from './frontend/build/handler.js'

const app = express();
//app.use(cors);
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
//app.use(handler);

app.listen(port, () => {
    console.log(`Server ready at port ${port}`);
});
