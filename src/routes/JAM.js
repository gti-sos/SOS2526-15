import Datastore from 'nedb';
const API_URL_JAM = "/api/v1/happiness-indices";
// 🔴 IMPORTANTE: ¡Cambia esto por tu enlace REAL de Postman!
const DOCUMENTATION_JAM = "https://documenter.getpostman.com/view/PON_AQUI_TU_ENLACE"; 

export function loadBackendJAM(app) {
    // Inicializamos NeDB (en memoria para que los tests sean idempotentes y limpios)
    const db = new Datastore(); 

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

    // ================== RUTAS ESPECIALES ==================

    app.get(`${API_URL_JAM}/docs`, (req, res) => {
        res.redirect(DOCUMENTATION_JAM);
    });

    app.get(`${API_URL_JAM}/loadInitialData`, (req, res) => {
        db.count({}, (err, count) => {
            if (count > 0) {
                return res.status(409).json({ message: "Los datos ya estaban cargados" });
            }
            db.insert(datosHappiness, (err, newDocs) => {
                newDocs.forEach(d => delete d._id); // Eliminamos el _id de nedb antes de enviar
                res.status(201).json(newDocs);
            });
        });
    });

    // ================== CONTROL DE ERRORES 405 ==================

    app.all(API_URL_JAM, (req, res, next) => {
        if (req.method !== "GET" && req.method !== "POST" && req.method !== "DELETE") {
            return res.status(405).json({ message: "Method Not Allowed" });
        }
        next();
    });

    app.all(`${API_URL_JAM}/:country`, (req, res) => {
        return res.status(405).json({ message: "Method Not Allowed" });
    });

    app.all(`${API_URL_JAM}/:country/:year`, (req, res, next) => {
        if (req.method !== "GET" && req.method !== "PUT" && req.method !== "DELETE") {
            return res.status(405).json({ message: "Method Not Allowed" });
        }
        next();
    });

    // ================== API REST CON NEDB ==================

    // 1. GET Colección (Con Paginación y Búsqueda por campos)
    app.get(API_URL_JAM, (req, res) => {
        let query = {};
        
        // Búsquedas (si vienen en la URL, las añadimos a la query de NeDB)
        if (req.query.country) query.country = req.query.country;
        if (req.query.year) query.year = parseInt(req.query.year);
        if (req.query.happiness_score) query.happiness_score = parseFloat(req.query.happiness_score);
        if (req.query.gdp_per_capita) query.gdp_per_capita = parseFloat(req.query.gdp_per_capita);
        if (req.query.social_support) query.social_support = parseFloat(req.query.social_support);

        // Paginación
        let limit = parseInt(req.query.limit) || 0; // 0 significa sin límite
        let offset = parseInt(req.query.offset) || 0;

        db.find(query).skip(offset).limit(limit).exec((err, data) => {
            if (err) return res.status(500).send("Error interno de la BD");
            data.forEach(d => delete d._id); // Borramos el _id de todos los resultados
            res.status(200).json(data);
        });
    });

    // 2. POST Colección
    app.post(API_URL_JAM, (req, res) => {
        let newData = req.body;

        // Comprobamos estructura exacta (tienen que estar todos los campos)
        if (!newData || !newData.country || !newData.year || !newData.happiness_score || !newData.gdp_per_capita || !newData.social_support) {
            return res.status(400).json({ message: "Faltan campos obligatorios o la estructura es incorrecta" });
        }

        newData.year = parseInt(newData.year);
        delete newData._id; // Nos aseguramos de que no metan un _id a mano

        db.findOne({ country: newData.country, year: newData.year }, (err, exists) => {
            if (exists) {
                return res.status(409).json({ message: "El recurso ya existe" });
            }
            db.insert(newData, (err, savedData) => {
                delete savedData._id; // No enviamos el _id de vuelta
                res.status(201).json(savedData);
            });
        });
    });

    // 3. DELETE Colección
    app.delete(API_URL_JAM, (req, res) => {
        db.remove({}, { multi: true }, (err, numRemoved) => {
            res.status(204).send();
        });
    });

    // 4. GET Recurso Específico
    app.get(`${API_URL_JAM}/:country/:year`, (req, res) => {
        let country = req.params.country;
        let year = parseInt(req.params.year);

        db.findOne({ country: country, year: year }, (err, resource) => {
            if (resource) {
                delete resource._id; // Ocultamos el _id
                res.status(200).json(resource);
            } else {
                res.status(404).json({ message: "Recurso no encontrado" });
            }
        });
    });

    // 5. PUT Recurso Específico
    app.put(`${API_URL_JAM}/:country/:year`, (req, res) => {
        let country = req.params.country;
        let year = parseInt(req.params.year);
        let body = req.body;

        if (body.country !== country || parseInt(body.year) !== year) {
            return res.status(400).json({ message: "Los identificadores no coinciden" });
        }

        if (!body.happiness_score || !body.gdp_per_capita || !body.social_support) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        body.year = parseInt(body.year);
        delete body._id; // Evitamos inyectar el _id modificado

        db.update({ country: country, year: year }, body, {}, (err, numReplaced) => {
            if (numReplaced === 1) {
                res.status(200).json(body);
            } else {
                res.status(404).json({ message: "Recurso no encontrado" });
            }
        });
    });

    // 6. DELETE Recurso Específico
    app.delete(`${API_URL_JAM}/:country/:year`, (req, res) => {
        let country = req.params.country;
        let year = parseInt(req.params.year);

        db.remove({ country: country, year: year }, {}, (err, numRemoved) => {
            if (numRemoved === 1) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: "Recurso no encontrado" });
            }
        });
    });
}