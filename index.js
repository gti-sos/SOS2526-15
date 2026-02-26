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

