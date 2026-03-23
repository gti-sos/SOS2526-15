import Datastore from 'nedb';
const API_URL_JAM_V2 = "/api/v2/happiness-indices";

export function loadBackendJAMv2(app) {
    const db = new Datastore(); 

    // 1. CARGAR DATOS INICIALES (Tus datos reales)
    app.get(`${API_URL_JAM_V2}/loadInitialData`, (req, res) => {
        db.find({}, (err, docs) => {
            if (docs.length === 0) {
                const initialData = [
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
                db.insert(initialData, (err, saved) => {
                    res.status(201).json(saved.map(d => { delete d._id; return d; }));
                });
            } else {
                res.status(409).send("Los datos ya estaban cargados.");
            }
        });
    });

    // 2. LISTAR TODOS (GET)
    app.get(API_URL_JAM_V2, (req, res) => {
        db.find({}, (err, data) => {
            res.json(data.map(d => { delete d._id; return d; }));
        });
    });

    // 3. CREAR UNO NUEVO (POST) - ¡Con control de duplicados!
    app.post(API_URL_JAM_V2, (req, res) => {
        const newData = req.body;
        // Comprobamos si ya existe ese país en ese año
        db.find({ country: newData.country, year: newData.year }, (err, docs) => {
            if (docs.length > 0) {
                return res.sendStatus(409); // 409 Conflict: Ya existe
            }
            db.insert(newData, (err, saved) => {
                delete saved._id;
                res.status(201).json(saved);
            });
        });
    });

    // 4. BORRAR TODOS (DELETE GLOBAL)
    app.delete(API_URL_JAM_V2, (req, res) => {
        db.remove({}, { multi: true }, (err, numRemoved) => {
            res.sendStatus(204);
        });
    });

    // 5. BUSCAR UNO CONCRETO (GET)
    app.get(`${API_URL_JAM_V2}/:country/:year`, (req, res) => {
        db.findOne({ country: req.params.country, year: parseInt(req.params.year) }, (err, item) => {
            if (item) { delete item._id; res.json(item); }
            else res.sendStatus(404);
        });
    });

    // 6. ACTUALIZAR UNO (PUT)
    app.put(`${API_URL_JAM_V2}/:country/:year`, (req, res) => {
        db.update({ country: req.params.country, year: parseInt(req.params.year) }, req.body, {}, (err, num) => {
            if (num === 1) res.status(200).json(req.body);
            else res.sendStatus(404);
        });
    });

    // 7. BORRAR UNO (DELETE INDIVIDUAL)
    app.delete(`${API_URL_JAM_V2}/:country/:year`, (req, res) => {
        db.remove({ country: req.params.country, year: parseInt(req.params.year) }, {}, (err, num) => {
            if (num === 1) res.sendStatus(204);
            else res.sendStatus(404);
        });
    });
}