const API_URL_JAM = "/api/v1/happiness-indices";
// IMPORTANTE: Pon aquí tu enlace de documentación real si lo tienes
const DOCUMENTATION_JAM = "https://documenter.getpostman.com/view/TU_ENLACE_AQUI"; 

export function loadBackendJAM(app) {
    // Array que hará de base de datos
    let db = []; 

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
        if (db.length === 0) {
            db = JSON.parse(JSON.stringify(datosHappiness)); // Copia profunda
            res.status(201).json(db);
        } else {
            res.status(409).json({ message: "Los datos ya estaban cargados" });
        }
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

    // ================== API REST ==================

    // GET Colección
    app.get(API_URL_JAM, (req, res) => {
        res.status(200).json(db);
    });

    // POST Colección
    app.post(API_URL_JAM, (req, res) => {
        let newData = req.body;

        if (!newData || !newData.country || !newData.year || !newData.happiness_score || !newData.gdp_per_capita || !newData.social_support) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        newData.year = parseInt(newData.year);

        const exists = db.find(d => d.country === newData.country && d.year === newData.year);
        if (exists) {
            return res.status(409).json({ message: "El recurso ya existe" });
        }

        db.push(newData);
        res.status(201).json(newData);
    });

    // DELETE Colección
    app.delete(API_URL_JAM, (req, res) => {
        db = [];
        res.status(204).send();
    });

    // GET Recurso Específico
    app.get(`${API_URL_JAM}/:country/:year`, (req, res) => {
        let country = req.params.country;
        let year = parseInt(req.params.year);

        const resource = db.find(d => d.country === country && d.year === year);
        if (resource) {
            res.status(200).json(resource);
        } else {
            res.status(404).json({ message: "Recurso no encontrado" });
        }
    });

    // PUT Recurso Específico
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

        const index = db.findIndex(d => d.country === country && d.year === year);
        
        if (index !== -1) {
            body.year = parseInt(body.year);
            db[index] = body;
            res.status(200).json(db[index]);
        } else {
            res.status(404).json({ message: "Recurso no encontrado" });
        }
    });

    // DELETE Recurso Específico
    app.delete(`${API_URL_JAM}/:country/:year`, (req, res) => {
        let country = req.params.country;
        let year = parseInt(req.params.year);

        const initialLength = db.length;
        db = db.filter(d => !(d.country === country && d.year === year));

        if (db.length < initialLength) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: "Recurso no encontrado" });
        }
    });
}