import dataStore from 'nedb';
const API_URL_JAM = "/api/v1/happiness-indices";
// IMPORTANTE: Pon aquí el enlace de tu documentación de Postman
const DOCUMENTATION_JAM = "https://documenter.getpostman.com/view/PON_TU_ENLACE_AQUI"; 

export function loadBackendJAM(app) {
    // 1. Inicializo la base de datos NeDB
    let db = new dataStore();

    // 2. Datos iniciales
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

    // Redirección a la documentación
    app.get(`${API_URL_JAM}/docs`, (req, res) => {
        res.redirect(DOCUMENTATION_JAM);
    });

    // Carga inicial de datos
    app.get(`${API_URL_JAM}/loadInitialData`, (req, res) => {
        db.find({}, (err, docs) => {
            if (err) return res.sendStatus(500);

            if (docs.length === 0) {
                db.insert(datosHappiness, (err, newDocs) => {
                    if (err) return res.sendStatus(500);
                    newDocs.forEach(d => delete d._id); // Quitamos _id
                    res.status(201).json(newDocs);
                });
            } else {
                res.status(409).json({ message: "Los datos ya estaban cargados" });
            }
        });
    });

    // ================== CONTROL DE ERRORES 405 ==================

    // 405 para la colección base (solo permite GET, POST, DELETE)
    app.all(API_URL_JAM, (req, res, next) => {
        if (req.method !== "GET" && req.method !== "POST" && req.method !== "DELETE") {
            return res.status(405).json({ message: "Method Not Allowed" });
        }
        next();
    });

    // 405 para rutas con solo país (NO se permite nada según tu diseño basado en :country/:year)
    app.all(`${API_URL_JAM}/:country`, (req, res) => {
        return res.status(405).json({ message: "Method Not Allowed" });
    });

    // 405 para recurso específico (solo permite GET, PUT, DELETE)
    app.all(`${API_URL_JAM}/:country/:year`, (req, res, next) => {
        if (req.method !== "GET" && req.method !== "PUT" && req.method !== "DELETE") {
            return res.status(405).json({ message: "Method Not Allowed" });
        }
        next();
    });

    // ================== API REST JAM ==================

    // GET a la colección (con búsqueda y paginación)
    app.get(API_URL_JAM, (req, res) => {
        let searchQuery = { ...req.query };
        let limit = 0;
        let offset = 0;

        // Paginación
        if (req.query.limit) {
            limit = parseInt(req.query.limit);
            delete searchQuery.limit;
        }
        if (req.query.offset) {
            offset = parseInt(req.query.offset);
            delete searchQuery.offset;
        }

        // Búsqueda: Convertimos a número los campos numéricos
        if (searchQuery.year) searchQuery.year = parseInt(searchQuery.year);
        if (searchQuery.happiness_score) searchQuery.happiness_score = parseFloat(searchQuery.happiness_score);
        if (searchQuery.gdp_per_capita) searchQuery.gdp_per_capita = parseFloat(searchQuery.gdp_per_capita);
        if (searchQuery.social_support) searchQuery.social_support = parseFloat(searchQuery.social_support);

        db.find(searchQuery).skip(offset).limit(limit).exec((err, docs) => {
            if (err) return res.sendStatus(500);
            
            docs.forEach(doc => delete doc._id); // Quitamos _id
            res.status(200).json(docs);
        });
    });

    // POST a la colección
    app.post(API_URL_JAM, (req, res) => {
        let newData = req.body;

        // Comprobamos campos obligatorios (400)
        if (!newData || !newData.country || !newData.year || !newData.happiness_score || !newData.gdp_per_capita || !newData.social_support) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        // Convertimos a número para asegurar la consistencia en BD
        newData.year = parseInt(newData.year);
        newData.happiness_score = parseFloat(newData.happiness_score);
        newData.gdp_per_capita = parseFloat(newData.gdp_per_capita);
        newData.social_support = parseFloat(newData.social_support);

        // Comprobamos conflicto (409)
        db.find({ country: newData.country, year: newData.year }, (err, docs) => {
            if (err) return res.sendStatus(500);
            if (docs.length > 0) {
                return res.status(409).json({ message: "El recurso ya existe" });
            }

            db.insert(newData, (err, newDoc) => {
                if (err) return res.sendStatus(500);
                delete newDoc._id; // Quitamos _id
                res.status(201).json(newDoc);
            });
        });
    });

    // DELETE a la colección
    app.delete(API_URL_JAM, (req, res) => {
        db.remove({}, { multi: true }, (err, numRemoved) => {
            if (err) return res.sendStatus(500);
            res.sendStatus(204); // 204 No Content es ideal para DELETE exitosos
        });
    });

    // GET a un recurso específico
    app.get(`${API_URL_JAM}/:country/:year`, (req, res) => {
        let country = req.params.country;
        let year = parseInt(req.params.year);

        db.findOne({ country: country, year: year }, (err, doc) => {
            if (err) return res.sendStatus(500);
            if (!doc) {
                return res.status(404).json({ message: "Recurso no encontrado" });
            }
            
            delete doc._id; // Quitamos _id
            res.status(200).json(doc);
        });
    });

    // PUT a un recurso específico
    app.put(`${API_URL_JAM}/:country/:year`, (req, res) => {
        let country = req.params.country;
        let year = parseInt(req.params.year);
        let body = req.body;

        // Validamos que los parámetros de la URL coincidan con el body (400)
        if (body.country !== country || parseInt(body.year) !== year) {
            return res.status(400).json({ message: "Los identificadores de la URL no coinciden con los del cuerpo" });
        }

        // Validamos campos obligatorios
        if (!body.happiness_score || !body.gdp_per_capita || !body.social_support) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        // Aseguramos tipos
        body.year = parseInt(body.year);
        body.happiness_score = parseFloat(body.happiness_score);
        body.gdp_per_capita = parseFloat(body.gdp_per_capita);
        body.social_support = parseFloat(body.social_support);

        db.update({ country: country, year: year }, body, {}, (err, numUpdated) => {
            if (err) return res.sendStatus(500);
            if (numUpdated === 0) {
                return res.status(404).json({ message: "Recurso no encontrado" });
            }
            res.status(200).json(body); // Devolvemos el objeto actualizado sin el _id
        });
    });

    // DELETE a un recurso específico
    app.delete(`${API_URL_JAM}/:country/:year`, (req, res) => {
        let country = req.params.country;
        let year = parseInt(req.params.year);

        db.remove({ country: country, year: year }, {}, (err, numRemoved) => {
            if (err) return res.sendStatus(500);
            if (numRemoved === 0) {
                return res.status(404).json({ message: "Recurso no encontrado" });
            }
            res.sendStatus(204);
        });
    });
}