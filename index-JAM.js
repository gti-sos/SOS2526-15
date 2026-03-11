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


// Lo que he añadido en L06
app.get('/api/v1/happiness-indices', (req, res) => {
    // 1. Preparar la paginación (si el usuario no manda limit/offset, por defecto es 0)
    const limit = req.query.limit ? parseInt(req.query.limit) : 0; 
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;

    // 2. Preparar la búsqueda por campos
    // Hacemos una copia de los parámetros de la URL para buscar
    const searchQuery = { ...req.query }; 
    // Borramos limit y offset de la búsqueda para que NeDB no intente buscar un recurso que tenga el campo "limit"
    delete searchQuery.limit;
    delete searchQuery.offset;

    // 3. Buscar en NeDB aplicando paginación
    db.find(searchQuery).skip(offset).limit(limit).exec((err, docs) => {
        if (err) {
            console.error("Error al acceder a la base de datos", err);
            res.sendStatus(500); 
        } else {
            // 4. Limpiar el _id autogenerado (requisito de la rúbrica)
            docs.forEach(doc => {
                delete doc._id;
            });
            
            // 5. Devolver siempre un Array en JSON con código 200 OK
            res.status(200).json(docs);
        }
    });
});