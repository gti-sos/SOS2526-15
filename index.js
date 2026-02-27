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
    { country: "españa", year: 2025, density: 98, population: 49337356, percentage_change: 0.49 },
    { country: "españa", year: 2024, density: 97, population: 49096877, percentage_change: 0.59 },
    { country: "españa", year: 2023, density: 96, population: 48628256, percentage_change: 0.51 },
    { country: "españa", year: 2022, density: 95, population: 48047631, percentage_change: 0.53 },
    { country: "alemania", year: 2022, density: 232, population: 83118501, percentage_change: -0.14 },
    { country: "alemania", year: 2023, density: 233, population: 83456045, percentage_change: 0.41 },
    { country: "alemania", year: 2024, density: 234, population: 83577140, percentage_change: 0.15 },
    { country: "alemania", year: 2025, density: 234, population: 83577140, percentage_change: 0.15 },
    { country: "ucrania", year: 2023, density: 63, population: 37732836, percentage_change: -8.08 },
    { country: "ucrania", year: 2022, density: 68, population: 41048766, percentage_change: 0.12 }
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
    const media = mediaPoblacion("españa");
    
    // Enviamos el resultado al navegador web
    res.send(`Media de población en España: ${media.toLocaleString('es-ES')}`);
});

// -------------------------------------------------

app.get(`${API_URL}/loadInitialData`, (req, res) => {
    if (stats.length === 0) {
        // Hacemos una copia de los datos originales
        stats = [datosDemograficos]; 
        res.status(201).json(stats);
    } else {
        res.status(409).json({ message: "Los datos ya estaban cargados" });
    }
});

// GET: Devuelve toda la lista
app.get(API_URL, (req, res) => {
    res.status(200).json(stats); // 200: OK
});

//_____________________________________________________________Fin tareas YHX_________________________
