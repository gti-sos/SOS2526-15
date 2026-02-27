const xlsx = require('xlsx');

// 1. Leer el archivo Excel desde la carpeta 'data'
// Sustituye 'datos.xlsx' por el nombre real de tu archivo si es distinto
const workbook = xlsx.readFile('./data/SOS2526-15-Propuesta.xlsx');

// 2. Obtener la primera pestaña (hoja) del Excel
const sheetName = workbook.SheetNames[2];
const worksheet = workbook.Sheets[sheetName];

// 3. Convertir los datos de esa hoja a un array de objetos (JSON)
const data = xlsx.utils.sheet_to_json(worksheet);

// Verificamos que se han cargado los datos correctamente
console.log(`Se han cargado ${data.length} filas desde el Excel.\n`);

// 4. Algoritmo para calcular la media
// Elegimos el valor geográfico que se repite (asegúrate de que existe en tu Excel)
const filterCountry = "finland";

// Usamos filter para obtener solo las filas de ese país
const filteredData = data.filter(item => item.country && item.country.toLowerCase() === filterCountry.toLowerCase());

if (filteredData.length === 0) {
    console.log(`No se encontraron datos para el país: ${filterCountry}`);
} else {
    // Usamos map para extraer solo los valores numéricos (happiness_score)
    // Usamos parseFloat por si el Excel lo lee como texto con comas
    const scores = filteredData.map(item => parseFloat(item.happiness_score));

    // Calculamos la media usando reduce
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // 5. Mostramos el resultado
    console.log(`La media de happiness_score para ${filterCountry} es: ${averageScore.toFixed(3)}`);
}