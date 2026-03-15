import dataStore from 'nedb';
let db = new dataStore()
const API_URL = "/api/v1/population-densities";
// ----------------------------------

export function loadBackendYHX(app){
    let stats = [];
    db.insert(stats);
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
    const DOCUMENTATION = "https://documenter.getpostman.com/view/52392777/2sBXigMtFk";

    app.get(`${API_URL}/docs`, (req, res) => {
    res.redirect(DOCUMENTATION);
    });

    app.get(`${API_URL}/loadInitialData`, (req, res) => {
        db.find({}, (err, docs) => {
            if (docs.length === 0) {
                db.insert(datosDemograficos, (err, newDocs) => {
                    if (err){
                        return res.sendStatus(500);
                    }

                    newDocs.forEach(d => delete d._id);
                    res.status(201).json(newDocs);
                });
            } else {
                res.status(409).json({ message: "Los datos ya estaban cargados" })
            }
        });
    });

    app.all(API_URL, (req, res, next) => {
        if (req.method !== "GET" && req.method !== "POST" && req.method !== "DELETE") {
            return res.status(405).json({ message: "Method Not Allowed" });
        }
        next();
    });

    app.all(`${API_URL}/:country`, (req, res, next) => {
        if (req.method !== "GET" && req.method !== "PUT" && req.method !== "DELETE") {
            return res.status(405).json({ message: "Method Not Allowed" });
        }
        next();
    });

    app.all(`${API_URL}/:country/:year`, (req, res, next) => {
        if (req.method !== "GET" && req.method !== "PUT" && req.method !== "DELETE") {
            return res.status(405).json({ message: "Method Not Allowed" });
        }
        next();
    });

    app.post(API_URL, (req, res) => {
        let newWage = req.body;

        if (!newWage.country || !newWage.year) {
            return res.status(400).json({ message: "Missing fields" });
        }

        db.find({ country: newWage.country, year: newWage.year }, (err, docs) => {

            if (docs.length > 0) {
                return res.status(409).json({ message: "Resource already exists" });
            }

            db.insert(newWage, (err, newDoc) => {

                delete newDoc._id;

                res.status(201).json(newDoc);

            });
        });
    });

    app.put(`${API_URL}/:country`, (req, res) => {

        let country = req.params.country;
        let body = req.body;

        if (body.country !== country) {
            return res.status(400).json({
                message: "El recurso del body debe coincidir con el de la URL"
            });
        }

        db.update(
            { country: country},
            body,
            {},
            (err, numUpdated) => {
                if (numUpdated === 0) {
                    return res.status(404).json({ message: "Recurso no encontrado" });
                }
                res.status(200).json({ message: "Recurso actualizado con éxito" });
            }
        );
    });

    app.put(`${API_URL}/:country/:year`, (req, res) => {

        let country = req.params.country;
        let year = parseInt(req.params.year);
        let body = req.body;

        if (body.country !== country || body.year !== year) {
            return res.status(400).json({
                message: "El recurso del body debe coincidir con el de la URL"
            });
        }

        db.update(
            { country: country, year: year },
            body,
            {},
            (err, numUpdated) => {

                if (numUpdated === 0) {
                    return res.status(404).json({});
                }

                res.status(200).json(body);

            }
        );

    });

    app.delete(API_URL, (req, res) => {
        db.remove({}, { multi: true }, (err, numRemoved) => {
            res.sendStatus(204);
        });
    });

    app.delete(`${API_URL}/:country`, (req, res) => {
        let country = req.params.country;
        db.remove(
            { country: country},
            {},
            (err, numRemoved) => {
                if (numRemoved === 0) {
                    return res.status(404).json({});
                }
                res.sendStatus(204);
            }
        );
    });

    app.delete(`${API_URL}/:country/:year`, (req, res) => {
        let country = req.params.country;
        let year = parseInt(req.params.year);

        db.remove(
            { country: country, year: year },
            {},
            (err, numRemoved) => {
                if (numRemoved === 0) {
                    return res.status(404).json({});
                }
                res.sendStatus(204);
            }
        );
    });

    app.get(API_URL, (req, res) => {
        let query = {};

        if (req.query.country) {
            query.country = req.query.country;
        }

        if (req.query.year) {
            query.year = parseInt(req.query.year);
        }

        if (req.query.density) {
            query.density = parseFloat(req.query.density);
        }

        if (req.query.population) {
            query.population = parseFloat(req.query.population);
        }

        if (req.query.percentage_change) {
            query.percentage_change = parseFloat(req.query.percentage_change);
        }

        db.find(query, (err, docs) => {
            if (err) {
                return res.sendStatus(500);
            }
            docs.forEach(d => delete d._id);
            res.status(200).json(docs);
        });
    });

    app.get(`${API_URL}/:country`, (req, res) => {
        let country = req.params.country;

        db.findOne({ country: country}, (err, doc) => {
            if (!doc) {
                return res.status(404).json({});
            }
            delete doc._id;
            res.status(200).json(doc);
        });
    });

    app.get(`${API_URL}/:country/:year`, (req, res) => {
        let country = req.params.country;
        let year = parseInt(req.params.year);

        db.findOne({ country: country, year: year }, (err, doc) => {
            if (!doc) {
                return res.status(404).json({});
            }
            delete doc._id;
            res.status(200).json(doc);
        });
    });

    //POST restriccion
    app.post(`${API_URL}/:country`, (req, res) => {
        return res.status(405).json({error: "POST not allowed on /:country"});

    });

    //PUT restriccion
    app.put(`${API_URL}/`, (req, res) => {
        return res.status(405).json({error: "PUT not allowed on /"});
    });
    //_____________________________________________________________Fin tareas YHX_________________________
}

