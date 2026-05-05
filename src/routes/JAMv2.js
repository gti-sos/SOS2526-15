import Datastore from 'nedb';
const API_URL_JAM_V2 = "/api/v2/happiness-indices";

export function loadBackendJAMv2(app) {
    const db = new Datastore(); 

    // 1. CARGAR DATOS INICIALES (Tus datos reales)
    app.get(`${API_URL_JAM_V2}/loadInitialData`, (req, res) => {
        db.find({}, (err, docs) => {
            if (docs.length === 0) {
                const initialData = [
                    // DATOS 2023
                    { country: "finland", year: 2023, happiness_score: 7.741, gdp_per_capita: 1.844, social_support: 1.572 },
                    { country: "denmark", year: 2023, happiness_score: 7.583, gdp_per_capita: 1.908, social_support: 1.520 },
                    { country: "iceland", year: 2023, happiness_score: 7.525, gdp_per_capita: 1.881, social_support: 1.617 },
                    { country: "israel", year: 2023, happiness_score: 7.341, gdp_per_capita: 1.803, social_support: 1.503 },
                    { country: "netherlands", year: 2023, happiness_score: 7.319, gdp_per_capita: 1.901, social_support: 1.464 },
                    { country: "sweden", year: 2023, happiness_score: 7.344, gdp_per_capita: 1.878, social_support: 1.501 },
                    { country: "norway", year: 2023, happiness_score: 7.302, gdp_per_capita: 1.952, social_support: 1.487 },
                    { country: "switzerland", year: 2023, happiness_score: 7.194, gdp_per_capita: 1.970, social_support: 1.430 },
                    { country: "luxembourg", year: 2023, happiness_score: 7.122, gdp_per_capita: 2.141, social_support: 1.341 },
                    { country: "new_zealand", year: 2023, happiness_score: 7.029, gdp_per_capita: 1.800, social_support: 1.493 },
                    { country: "austria", year: 2023, happiness_score: 6.905, gdp_per_capita: 1.885, social_support: 1.347 },
                    { country: "australia", year: 2023, happiness_score: 7.057, gdp_per_capita: 1.854, social_support: 1.461 },
                    { country: "germany", year: 2023, happiness_score: 6.719, gdp_per_capita: 1.875, social_support: 1.288 },
                    { country: "united_states", year: 2023, happiness_score: 6.725, gdp_per_capita: 1.931, social_support: 1.427 },
                    { country: "spain", year: 2023, happiness_score: 6.421, gdp_per_capita: 1.763, social_support: 1.397 },
                    { country: "mexico", year: 2023, happiness_score: 6.678, gdp_per_capita: 1.543, social_support: 1.233 },
                    { country: "brazil", year: 2023, happiness_score: 6.272, gdp_per_capita: 1.428, social_support: 1.258 },
                    { country: "argentina", year: 2023, happiness_score: 6.188, gdp_per_capita: 1.554, social_support: 1.305 },
                    { country: "japan", year: 2023, happiness_score: 6.060, gdp_per_capita: 1.791, social_support: 1.348 },
                    { country: "south_africa", year: 2023, happiness_score: 5.422, gdp_per_capita: 1.378, social_support: 1.202 },

                    // DATOS 2022 
                    { country: "finland", year: 2022, happiness_score: 7.804, gdp_per_capita: 1.888, social_support: 1.585 },
                    { country: "denmark", year: 2022, happiness_score: 7.586, gdp_per_capita: 1.949, social_support: 1.548 },
                    { country: "iceland", year: 2022, happiness_score: 7.530, gdp_per_capita: 1.926, social_support: 1.620 },
                    { country: "israel", year: 2022, happiness_score: 7.473, gdp_per_capita: 1.833, social_support: 1.521 },
                    { country: "netherlands", year: 2022, happiness_score: 7.403, gdp_per_capita: 1.942, social_support: 1.488 },
                    { country: "sweden", year: 2022, happiness_score: 7.395, gdp_per_capita: 1.921, social_support: 1.510 },
                    { country: "norway", year: 2022, happiness_score: 7.315, gdp_per_capita: 1.994, social_support: 1.521 },
                    { country: "switzerland", year: 2022, happiness_score: 7.240, gdp_per_capita: 2.022, social_support: 1.463 },
                    { country: "luxembourg", year: 2022, happiness_score: 7.228, gdp_per_capita: 2.200, social_support: 1.357 },
                    { country: "new_zealand", year: 2022, happiness_score: 7.123, gdp_per_capita: 1.842, social_support: 1.544 },
                    { country: "austria", year: 2022, happiness_score: 7.097, gdp_per_capita: 1.927, social_support: 1.382 },
                    { country: "australia", year: 2022, happiness_score: 7.095, gdp_per_capita: 1.899, social_support: 1.497 },
                    { country: "germany", year: 2022, happiness_score: 6.892, gdp_per_capita: 1.919, social_support: 1.319 },
                    { country: "united_states", year: 2022, happiness_score: 6.894, gdp_per_capita: 1.980, social_support: 1.460 },
                    { country: "spain", year: 2022, happiness_score: 6.436, gdp_per_capita: 1.815, social_support: 1.432 },
                    { country: "mexico", year: 2022, happiness_score: 6.330, gdp_per_capita: 1.571, social_support: 1.258 },
                    { country: "brazil", year: 2022, happiness_score: 6.125, gdp_per_capita: 1.454, social_support: 1.284 },
                    { country: "argentina", year: 2022, happiness_score: 6.024, gdp_per_capita: 1.583, social_support: 1.332 },
                    { country: "japan", year: 2022, happiness_score: 6.129, gdp_per_capita: 1.838, social_support: 1.373 },
                    { country: "south_africa", year: 2022, happiness_score: 5.275, gdp_per_capita: 1.417, social_support: 1.221 },

                    // DATOS 2021 
                    { country: "finland", year: 2021, happiness_score: 7.821, gdp_per_capita: 1.892, social_support: 1.258 },
                    { country: "denmark", year: 2021, happiness_score: 7.620, gdp_per_capita: 1.953, social_support: 1.243 },
                    { country: "iceland", year: 2021, happiness_score: 7.557, gdp_per_capita: 1.936, social_support: 1.320 },
                    { country: "israel", year: 2021, happiness_score: 7.364, gdp_per_capita: 1.826, social_support: 1.221 },
                    { country: "netherlands", year: 2021, happiness_score: 7.415, gdp_per_capita: 1.945, social_support: 1.206 },
                    { country: "sweden", year: 2021, happiness_score: 7.384, gdp_per_capita: 1.920, social_support: 1.220 },
                    { country: "norway", year: 2021, happiness_score: 7.365, gdp_per_capita: 1.997, social_support: 1.239 },
                    { country: "switzerland", year: 2021, happiness_score: 7.364, gdp_per_capita: 2.026, social_support: 1.226 },
                    { country: "luxembourg", year: 2021, happiness_score: 7.404, gdp_per_capita: 2.209, social_support: 1.155 },
                    { country: "new_zealand", year: 2021, happiness_score: 7.200, gdp_per_capita: 1.852, social_support: 1.235 },
                    { country: "austria", year: 2021, happiness_score: 7.163, gdp_per_capita: 1.925, social_support: 1.203 },
                    { country: "australia", year: 2021, happiness_score: 7.162, gdp_per_capita: 1.900, social_support: 1.203 },
                    { country: "germany", year: 2021, happiness_score: 7.034, gdp_per_capita: 1.924, social_support: 1.088 },
                    { country: "united_states", year: 2021, happiness_score: 6.977, gdp_per_capita: 1.982, social_support: 1.182 },
                    { country: "spain", year: 2021, happiness_score: 6.476, gdp_per_capita: 1.808, social_support: 1.211 },
                    { country: "mexico", year: 2021, happiness_score: 6.128, gdp_per_capita: 1.552, social_support: 0.886 },
                    { country: "brazil", year: 2021, happiness_score: 6.293, gdp_per_capita: 1.462, social_support: 1.044 },
                    { country: "argentina", year: 2021, happiness_score: 5.967, gdp_per_capita: 1.592, social_support: 1.102 },
                    { country: "japan", year: 2021, happiness_score: 6.039, gdp_per_capita: 1.835, social_support: 1.089 },
                    { country: "south_africa", year: 2021, happiness_score: 5.194, gdp_per_capita: 1.425, social_support: 0.911 },

                    // DATOS 2020 
                    { country: "finland", year: 2020, happiness_score: 7.842, gdp_per_capita: 1.446, social_support: 1.106 },
                    { country: "denmark", year: 2020, happiness_score: 7.620, gdp_per_capita: 1.502, social_support: 1.108 },
                    { country: "iceland", year: 2020, happiness_score: 7.554, gdp_per_capita: 1.482, social_support: 1.172 },
                    { country: "israel", year: 2020, happiness_score: 7.157, gdp_per_capita: 1.397, social_support: 1.047 },
                    { country: "netherlands", year: 2020, happiness_score: 7.464, gdp_per_capita: 1.501, social_support: 1.079 },
                    { country: "sweden", year: 2020, happiness_score: 7.363, gdp_per_capita: 1.478, social_support: 1.062 },
                    { country: "norway", year: 2020, happiness_score: 7.392, gdp_per_capita: 1.543, social_support: 1.108 },
                    { country: "switzerland", year: 2020, happiness_score: 7.571, gdp_per_capita: 1.566, social_support: 1.079 },
                    { country: "luxembourg", year: 2020, happiness_score: 7.324, gdp_per_capita: 1.751, social_support: 1.003 },
                    { country: "new_zealand", year: 2020, happiness_score: 7.277, gdp_per_capita: 1.400, social_support: 1.083 },
                    { country: "austria", year: 2020, happiness_score: 7.268, gdp_per_capita: 1.481, social_support: 1.055 },
                    { country: "australia", year: 2020, happiness_score: 7.183, gdp_per_capita: 1.453, social_support: 1.076 },
                    { country: "germany", year: 2020, happiness_score: 7.155, gdp_per_capita: 1.488, social_support: 1.033 },
                    { country: "united_states", year: 2020, happiness_score: 6.951, gdp_per_capita: 1.533, social_support: 1.031 },
                    { country: "spain", year: 2020, happiness_score: 6.491, gdp_per_capita: 1.375, social_support: 1.057 },
                    { country: "mexico", year: 2020, happiness_score: 6.317, gdp_per_capita: 1.115, social_support: 0.714 },
                    { country: "brazil", year: 2020, happiness_score: 6.330, gdp_per_capita: 1.028, social_support: 0.898 },
                    { country: "argentina", year: 2020, happiness_score: 5.929, gdp_per_capita: 1.162, social_support: 0.980 },
                    { country: "japan", year: 2020, happiness_score: 5.940, gdp_per_capita: 1.389, social_support: 0.949 },
                    { country: "south_africa", year: 2020, happiness_score: 4.956, gdp_per_capita: 0.967, social_support: 0.895 }
                ];
                db.insert(initialData, (err, saved) => {
                    res.status(201).json(saved.map(d => { delete d._id; return d; }));
                });
            } else {
                res.status(409).send("Los datos ya estaban cargados.");
            }
        });
    });

    // 2. REDIRECCIÓN A LA DOCUMENTACIÓN DE POSTMAN
    app.get(`${API_URL_JAM_V2}/docs`, (req, res) => {
        res.redirect("https://documenter.getpostman.com/view/52395798/2sBXijJrgQ");
    });

    // 3. LISTAR TODOS (GET) CON BÚSQUEDA AVANZADA
    app.get(API_URL_JAM_V2, (req, res) => {
        let query = {};
        if (req.query.country) query.country = req.query.country;
        if (req.query.from || req.query.to) {
            query.year = {};
            if (req.query.from) query.year.$gte = parseInt(req.query.from);
            if (req.query.to) query.year.$lte = parseInt(req.query.to);
        } else if (req.query.year) {
            query.year = parseInt(req.query.year);
        }
        if (req.query.happiness_score) query.happiness_score = parseFloat(req.query.happiness_score);
        if (req.query.gdp_per_capita) query.gdp_per_capita = parseFloat(req.query.gdp_per_capita);
        if (req.query.social_support) query.social_support = parseFloat(req.query.social_support);

        let limit = parseInt(req.query.limit) || 0;
        let offset = parseInt(req.query.offset) || 0;

        db.find(query).skip(offset).limit(limit).exec((err, data) => {
            if (err) return res.status(500).send("Error interno");
            res.json(data.map(d => { delete d._id; return d; }));
        });
    });

    // 4. CREAR UNO NUEVO (POST)
    app.post(API_URL_JAM_V2, (req, res) => {
        const newData = req.body;
        if (!newData || !newData.country || !newData.year || 
            newData.happiness_score === undefined || 
            newData.gdp_per_capita === undefined || 
            newData.social_support === undefined) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }
        newData.year = parseInt(newData.year);
        delete newData._id;
        db.find({ country: newData.country, year: newData.year }, (err, docs) => {
            if (docs.length > 0) return res.sendStatus(409); 
            db.insert(newData, (err, saved) => {
                delete saved._id;
                res.status(201).json(saved);
            });
        });
    });

    // 5. BORRAR TODOS (DELETE GLOBAL)
    app.delete(API_URL_JAM_V2, (req, res) => {
        db.remove({}, { multi: true }, (err, numRemoved) => {
            res.sendStatus(204);
        });
    });

    // 6. BUSCAR UNO CONCRETO (GET)
    app.get(`${API_URL_JAM_V2}/:country/:year`, (req, res) => {
        db.findOne({ country: req.params.country, year: parseInt(req.params.year) }, (err, item) => {
            if (item) { delete item._id; res.json(item); }
            else res.sendStatus(404);
        });
    });

    // 7. ACTUALIZAR UNO (PUT)
    app.put(`${API_URL_JAM_V2}/:country/:year`, (req, res) => {
        db.update({ country: req.params.country, year: parseInt(req.params.year) }, req.body, {}, (err, num) => {
            if (num === 1) res.status(200).json(req.body);
            else res.sendStatus(404);
        });
    });

    // 8. BORRAR UNO (DELETE INDIVIDUAL)
    app.delete(`${API_URL_JAM_V2}/:country/:year`, (req, res) => {
        db.remove({ country: req.params.country, year: parseInt(req.params.year) }, {}, (err, num) => {
            if (num === 1) res.sendStatus(204);
            else res.sendStatus(404);
        });
    });

    // ─────────────────────────────────────────────
    // PROXIES JAM — añadidos para D03.B
    // ─────────────────────────────────────────────

    // PROXY 1: Rest Countries (API externa pública)
    // Frontend lo llama en: GET /api/v2/happiness-indices/proxy-countries
    app.get(`${API_URL_JAM_V2}/proxy-countries`, async (req, res) => {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,region,population');
            if (!response.ok) throw new Error(`restcountries devolvió ${response.status}`);
            const data = await response.json();
            res.json(data);
        } catch (error) {
            console.error('proxy-countries error:', error.message);
            res.status(502).json({ error: 'Error en el proxy de países' });
        }
    });

    // PROXY 2: GitHub API (token seguro en servidor via variable de entorno)
    // Frontend lo llama en: GET /api/v2/happiness-indices/proxy-github
    app.get(`${API_URL_JAM_V2}/proxy-github`, async (req, res) => {
        try {
            const GITHUB_USERNAME = 'JavierArroyoMarcos';
            const headers = { 'User-Agent': 'SOS2526-15' };
            if (process.env.GITHUB_TOKEN) {
                headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
            }
            const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, { headers });
            if (!response.ok) throw new Error(`GitHub devolvió ${response.status}`);
            const data = await response.json();
            res.json(data);
        } catch (error) {
            console.error('proxy-github error:', error.message);
            res.status(502).json({ error: 'Error en el proxy de GitHub' });
        }
    });

}