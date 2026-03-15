import express from 'express';
import cool from 'cool-ascii-faces';

const app = express();
const port = process.env.PORT || 8080; 
import {loadBackendSMB} from './src/routes/SMB.js';
import {loadBackendYHX} from './src/routes/YHX.js';

app.use('/', express.static('public'));

app.use(express.json());

// api rest JAM
const API_URL_JAM = "/api/v1/happiness-indices";
let happinessIndices = [];
// -----------------------------------

loadBackendSMB(app);
loadBackendYHX(app);

app.listen(port, () => {
    console.log(`Server ready at port ${port}`);
});

//--- Datos y algoritmo de JAM ---
const datosHappiness = [
    { country: "finland", year: 2023, happiness_score: 7.804, gdp_per_capita: 1.888, social_support: 1.585 },
    { country: "denmark", year: 2023, happiness_score: 7.586, gdp_per_capita: 1.949, social_support: 1.548 },
    { country: "iceland", year: 2023, happiness_score: 7.530, gdp_per_capita: 1.926, social_support: 1.620 },
    { country: "israel", year: 2023, happiness_score: 7.473, gdp_per_capita: 1.833, social_support: 1.521 },
    { country: "netherlands", year: 2023, happiness_score: 7.403, gdp_per_capita: 1.942, social_support: 1.488 },
    { country: "sweden", year: 2023, happiness_score: 7.395, gdp_per_capita: 1.921, social_support: 1.510 },
    { country: "norway", year: 2023, happiness_score: 7.315, gdp_per_capita: 1.994, social_support: 1.521 },
    { country: "switzerland", year: 2023, happiness_score: 7.240, gdp_per_capita: 2.022, social_support: 1.463 },
    { country: "luxembourg", year: 2023, happiness_score: 7.228, gdp_per_capita: 2.200, social_support: 1.357 },
    { country: "new_zealand", year: 2023, happiness_score: 7.123, gdp_per_capita: 1.842, social_support: 1.544 },
    { country: "austria", year: 2023, happiness_score: 7.097, gdp_per_capita: 1.927, social_support: 1.382 },
    { country: "australia", year: 2023, happiness_score: 7.095, gdp_per_capita: 1.899, social_support: 1.497 },
    { country: "germany", year: 2023, happiness_score: 6.892, gdp_per_capita: 1.919, social_support: 1.319 },
    { country: "united_states", year: 2023, happiness_score: 6.894, gdp_per_capita: 1.980, social_support: 1.460 },
    { country: "spain", year: 2023, happiness_score: 6.436, gdp_per_capita: 1.815, social_support: 1.432 },
    { country: "mexico", year: 2023, happiness_score: 6.330, gdp_per_capita: 1.571, social_support: 1.258 },
    { country: "brazil", year: 2023, happiness_score: 6.125, gdp_per_capita: 1.454, social_support: 1.284 },
    { country: "argentina", year: 2023, happiness_score: 6.024, gdp_per_capita: 1.583, social_support: 1.332 },
    { country: "japan", year: 2023, happiness_score: 6.129, gdp_per_capita: 1.838, social_support: 1.373 },
    { country: "south_africa", year: 2023, happiness_score: 5.275, gdp_per_capita: 1.417, social_support: 1.221 },
    { country: "finland", year: 2022, happiness_score: 7.803, gdp_per_capita: 1.887, social_support: 1.583 }
];
function mediaFelicidad(pais) {
    let subconjunto = datosHappiness.filter(d => d.country === pais);
    
    if (subconjunto.length === 0) {
        return 0;
    }

    let sumaFelicidad = subconjunto.reduce((acumulador, d) => acumulador + d.happiness_score, 0);
    let media = sumaFelicidad / subconjunto.length;
    
    return media;
}
app.get('/samples/JAM', (req, res) => {
    const media = mediaFelicidad("finland");
    res.send(`Media de puntuación de felicidad en Finlandia: ${media.toLocaleString('es-ES')}`);
});

//  -------------------------------------------------

app.get(`${API_URL_JAM}/loadInitialData`, (req, res) => {
    if (happinessIndices.length === 0) {
        happinessIndices = [...datosHappiness]; 
        res.status(201).json(happinessIndices);
    } else {
        res.status(409).json({ message: "Los datos ya estaban cargados" });
    }
});
// GET: Devuelve toda la lista
app.get(API_URL, (req, res) => {
    res.status(200).json(stats); // 200: OK
});

//POST restriccion
app.post("/:country", (req, res) => {
    return sendJson(res, 405, {error: "POST not allowed on /:country"});
});
//PUT restriccion
app.put("/", (req, res) => {
    return sendJson(res, 405, {error: "PUT not allowed on /"});
});


// GET JAM
app.get(API_URL_JAM, (req, res) => {
    res.status(200).json(happinessIndices);
});
//_____________________________________________________________Fin tareas JAM_________________________

// =========================================================================
// ==================== INICIO API REST JAM ================================
// =========================================================================

// 1. GET a la colección (Devuelve todos)
app.get(API_URL_JAM, (req, res) => {
    res.status(200).json(happinessIndices);
});

// 2. POST a la colección (Crear un nuevo dato)
app.post(API_URL_JAM, (req, res) => {
    const newData = req.body;

    // Validación de campos esperados (Error 400)
    if (!newData || !newData.country || !newData.year || !newData.happiness_score || !newData.gdp_per_capita || !newData.social_support) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Comprobar si ya existe (Error 409)
    const exists = happinessIndices.find(d => d.country === newData.country && d.year === newData.year);
    if (exists) {
        return res.status(409).json({ message: "El recurso ya existe" });
    }

    happinessIndices.push(newData);
    res.status(201).json(newData); // Se suele devolver el objeto creado
});

// 3. PUT a la colección (NO PERMITIDO - Error 405)
app.put(API_URL_JAM, (req, res) => {
    res.status(405).json({ message: "Método PUT no permitido en la colección" });
});

// 4. DELETE a la colección (Borrar todos)
app.delete(API_URL_JAM, (req, res) => {
    happinessIndices = [];
    res.status(200).json({ message: "Todos los recursos han sido eliminados" });
});

// -------------------------------------------------------------------------

// 5. GET a un recurso específico (por país y año)
app.get(`${API_URL_JAM}/:country/:year`, (req, res) => {
    const country = req.params.country;
    const year = parseInt(req.params.year); // ¡Cuidado con parsear el año a número!

    const resource = happinessIndices.find(d => d.country === country && d.year === year);
    
    if (resource) {
        res.status(200).json(resource);
    } else {
        res.status(404).json({ message: "Recurso no encontrado" });
    }
});

// 6. POST a un recurso específico (NO PERMITIDO - Error 405)
app.post(`${API_URL_JAM}/:country/:year`, (req, res) => {
    res.status(405).json({ message: "Método POST no permitido en un recurso específico" });
});

// 7. PUT a un recurso específico (Actualizar)
app.put(`${API_URL_JAM}/:country/:year`, (req, res) => {
    const country = req.params.country;
    const year = parseInt(req.params.year);
    const body = req.body;

    // Validación: los datos de la URL deben coincidir con el body (Error 400)
    if (body.country !== country || body.year !== year) {
        return res.status(400).json({ message: "Los identificadores de la URL no coinciden con los del cuerpo (JSON)" });
    }

    // Validación de que lleguen todos los campos (opcional pero recomendado)
    if (!body.happiness_score || !body.gdp_per_capita || !body.social_support) {
        return res.status(400).json({ message: "Faltan campos obligatorios en el JSON" });
    }

    const index = happinessIndices.findIndex(d => d.country === country && d.year === year);
    
    if (index !== -1) {
        happinessIndices[index] = body; // Reemplazamos el objeto
        res.status(200).json(happinessIndices[index]);
    } else {
        res.status(404).json({ message: "Recurso no encontrado" });
    }
});

// 8. DELETE a un recurso específico (por país y año)
app.delete(`${API_URL_JAM}/:country/:year`, (req, res) => {
    const country = req.params.country;
    const year = parseInt(req.params.year);

    const initialLength = happinessIndices.length;
    happinessIndices = happinessIndices.filter(d => !(d.country === country && d.year === year));

    if (happinessIndices.length < initialLength) {
        res.status(200).json({ message: "Recurso eliminado" });
    } else {
        res.status(404).json({ message: "Recurso no encontrado" });
    }
});

// =========================================================================
// ==================== FIN API REST JAM ===================================
// =========================================================================

app.get('/cool', (req, res) => {
    res.send(cool());
});