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
    // Filtramos por país
    let subconjunto = datosDemograficos.filter(d => d.country === pais);
    
    // Validamos que haya datos para evitar dividir por cero (NaN)
    if (subconjunto.length === 0) {
        console.log(`No hay datos registrados para ${pais}.`);
        return 0;
    }

    // Usamos reduce para sumar directamente la propiedad 'population'
    let sumaPoblacion = subconjunto.reduce((acumulador, d) => acumulador + d.population, 0);
    
    // Calculamos la media
    let media = sumaPoblacion / subconjunto.length;
    
    console.log(`Media de población en ${pais}: ${media.toLocaleString('es-ES')}`);
    return media;
}

mediaPoblacion("España");