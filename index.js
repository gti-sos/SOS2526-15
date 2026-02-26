const express = require('express');
const cool = require('cool-ascii-faces');
const app = express();
const port = process.env.PORT || 8080; 

app.use('/', express.static('public'));

app.use(express.json());

let stats = [];

const API_URL = "/api/v1/population-stats";

app.get('/cool', (req, res) => {
    res.send(cool());
});

app.listen(port, () => {
    console.log(`Server ready at port ${port}`);
});

// --- Datos y algoritmo de YHX ---
const datosDemograficos = [
    { country: "España", year: 2025, density: 98, population: 49337356, percentage_change: 0.49 },
    { country: "España", year: 2024, density: 97, population: 49096877, percentage_change: 0.59 },
    { country: "España", year: 2023, density: 96, population: 48628256, percentage_change: 0.51 },
    { country: "España", year: 2022, density: 95, population: 48047631, percentage_change: 0.53 },
    { country: "Alemania", year: 2022, density: 232, population: 83118501, percentage_change: -0.14 },
    { country: "Alemania", year: 2023, density: 233, population: 83456045, percentage_change: 0.41 },
    { country: "Alemania", year: 2024, density: 234, population: 83577140, percentage_change: 0.15 },
    { country: "Alemania", year: 2025, density: 234, population: 83577140, percentage_change: 0.15 },
    { country: "Ucrania", year: 2023, density: 63, population: 37732836, percentage_change: -8.08 },
    { country: "Ucrania", year: 2022, density: 68, population: 41048766, percentage_change: 0.12 }
];

function mediaPoblacion(pais) {
    let subconjunto = datosDemograficos.filter(d => d.country === pais);
    
    if (subconjunto.length === 0) {
        return 0;
    }

    let sumaPoblacion = subconjunto.reduce((acumulador, d) => acumulador + d.population, 0);
    let media = sumaPoblacion / subconjunto.length;
    
    return media;
}

app.get('/samples/YHX', (req, res) => {
    // Calculamos la media llamando a tu función
    const media = mediaPoblacion("España");
    
    // Enviamos el resultado al navegador web
    res.send(`Media de población en España: ${media.toLocaleString('es-ES')}`);
});

// -------------------------------------------------

app.get(`${API_URL}/loadInitialData`, (req, res) => {

    stats = datosDemograficos
    res.status(201).json(stats); // 201: Creado
});

// GET: Devuelve toda la lista
app.get(API_URL, (req, res) => {
    res.status(200).json(stats); // 200: OK
});

// POST: Crea un recurso nuevo
app.post(API_URL, (req, res) => {
    const newData = req.body;

    // Validación: Faltan campos (400)
    if (!newData.country || !newData.year || !newData.density || !newData.population || !newData.percentage_change) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Validación: El recurso ya existe (409)
    const exists = stats.find(s => s.country === newData.country && s.year === newData.year);
    if (exists) {
        return res.status(409).json({ message: "El recurso ya existe" });
    }

    stats.push(newData);
    res.status(201).json({ message: "Recurso creado correctamente" }); // 201: Creado
});

// PUT: Método no permitido en la colección base (405)
app.put(API_URL, (req, res) => {
    res.status(405).json({ message: "Método no permitido en la colección base" });
});

// DELETE: Borra toda la lista
app.delete(API_URL, (req, res) => {
    stats = [];
    res.status(200).json({ message: "Todos los recursos borrados" }); // 200: OK
});

// GET: Devuelve un recurso específico
app.get(`${API_URL}/:country/:year`, (req, res) => {
    const { country, year } = req.params;
    const stat = stats.find(s => s.country === country && s.year === parseInt(year));

    if (stat) {
        res.status(200).json(stat); // 200: OK
    } else {
        res.status(404).json({ message: "Recurso no encontrado" }); // 404: No encontrado
    }
});

// POST: Método no permitido en un recurso específico (405)
app.post(`${API_URL}/:country/:year`, (req, res) => {
    res.status(405).json({ message: "Método no permitido. Usa POST en la colección base." });
});

// PUT: Actualiza un recurso específico
app.put(`${API_URL}/:country/:year`, (req, res) => {
    const { country, year } = req.params;
    const updateData = req.body;

    // Validación: IDs coinciden (400)
    if (updateData.country !== country || updateData.year !== parseInt(year)) {
        return res.status(400).json({ message: "Los IDs de la URL y del body no coinciden" });
    }

    const index = stats.findIndex(s => s.country === country && s.year === parseInt(year));

    if (index !== -1) {
        stats[index] = updateData;
        res.status(200).json({ message: "Recurso actualizado" }); // 200: OK
    } else {
        res.status(404).json({ message: "Recurso no encontrado" }); // 404: No encontrado
    }
});

// DELETE: Borra un recurso específico
app.delete(`${API_URL}/:country/:year`, (req, res) => {
    const { country, year } = req.params;
    const initialLength = stats.length;
    stats = stats.filter(s => !(s.country === country && s.year === parseInt(year)));

    if (stats.length < initialLength) {
        res.status(200).json({ message: "Recurso borrado" }); // 200: OK
    } else {
        res.status(404).json({ message: "Recurso no encontrado" }); // 404: No encontrado
    }
});

//_____________________________________________________________Fin tareas YHX_________________________
