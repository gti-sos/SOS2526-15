const express = require('express');
const cool = require('cool-ascii-faces');
const app = express();
const port = process.env.PORT || 8080; 

app.use('/', express.static('public'));

app.use(express.json());
// api rest YHX
let stats = [];

const API_URL = "/api/v1/population-densities";
// ----------------------------------
// api rest SMB
const API_URL_SMB = "/api/v1/minimum-interprofessional-wages";

let minimumInterprofessionalWages = [];
// ----------------------------------
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

//--- Datos y algoritmo de SMB ---
const datosNmw = [
    { country: "iran", date: 2024, national_currency_minimum_wage: 53073300.00, nmw_on_dollar: 1263.70, percentage_change: -6.04 },
    { country: "united states", date: 2026, national_currency_minimum_wage: 1257.00, nmw_on_dollar: 1257.00, percentage_change: -3.48 },
    { country: "united states", date: 2025, national_currency_minimum_wage: 1257.00, nmw_on_dollar: 1257.00, percentage_change: -8.38 },
    { country: "united states", date: 2024, national_currency_minimum_wage: 1257.00, nmw_on_dollar: 1257.00, percentage_change: 1.85 },
    { country: "iran", date: 2022, national_currency_minimum_wage: 26554950.00, nmw_on_dollar: 632.30, percentage_change: 126.70 },
    { country: "spain", date: 2026, national_currency_minimum_wage: 1381.00, nmw_on_dollar: 1622.70, percentage_change: 0 },
    { country: "spain", date: 2025, national_currency_minimum_wage: 1381.00, nmw_on_dollar: 1435.00, percentage_change: -0.02 },
    { country: "spain", date: 2024, national_currency_minimum_wage: 1381.00, nmw_on_dollar: 1461.90, percentage_change: 0 },
    { country: "canada", date: 2025, national_currency_minimum_wage: 2872.10, nmw_on_dollar: 1994.50, percentage_change: 0.81 },
    { country: "portugal", date: 2026, national_currency_minimum_wage: 1073.00, nmw_on_dollar: 1260.80, percentage_change: 5.71 }
];

function mediaSalario(pais){
    let subconjunto = datosNmw.filter(d => d.country === pais);
    let valores = subconjunto.map(d => d.nmw_on_dollar);
    let suma = 0;
    valores.forEach(valor => {
        suma += valor;
    });
    let media = valores.length > 0 ? suma / valores.length : 0;
    return media;
}

app.get('/samples/SMB', (req, res) => {

    const media = mediaSalario("spain");

    res.send(`Media del salario mínimo en dólares en España: ${media.toLocaleString('es-ES')}`);
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

app.get(`${API_URL_SMB}/loadInitialData`, (req, res) => {

    if (minimumInterprofessionalWages.length === 0) {
        minimumInterprofessionalWages = [...datosNmw]; 
        res.status(201).json(minimumInterprofessionalWages);
    } else {
        res.status(409).json({ message: "Los datos ya estaban cargados" });
    }
});

// GET: Devuelve toda la lista
app.get(API_URL, (req, res) => {
    res.status(200).json(stats); // 200: OK
});

//_____________________________________________________________Fin tareas YHX_________________________
// GET: Devuelve toda la lista
 app.get(API_URL_SMB, (req, res) => {
    res.status(200).json(minimumInterprofessionalWages);
});
//_____________________________________________________________Fin tareas SMB_________________________