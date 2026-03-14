// api rest SMB
import dataStore from 'nedb';
const API_URL_SMB = "/api/v1/minimum-interprofessional-wages";
let db = new dataStore();

export function loadBackendSMB(app){
    let minimumInterprofessionalWages = [];
    db.insert(minimumInterprofessionalWages)
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
    const DOCUMENTATION = "https://documenter.getpostman.com/view/52405032/2sBXigMDHy";

    router.get(`${API_URL_SMB}/docs`, (req, res) => {
    res.redirect(DOCUMENTATION);
    });
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
  app.get(`${API_URL_SMB}/loadInitialData`, (req, res) => {

    db.find({}, (err, docs) => {

        if (docs.length === 0) {

            db.insert(datosNmw, (err, newDocs) => {
                if (err) {
                    return res.sendStatus(500);
                }

                newDocs.forEach(d => delete d._id);
                res.status(201).json(newDocs);
    });

        } else {
            res.status(409).json({ message: "Los datos ya estaban cargados" });
        }
    });

    });
        // 405 para SMB
    app.all(API_URL_SMB, (req, res, next) => {
        if (req.method !== "GET" && req.method !== "POST" && req.method !== "DELETE") {
            return res.status(405).json({ message: "Method Not Allowed" });
        }
        next();
    });


    app.all(`${API_URL_SMB}/:country`, (req, res, next) => {
        if (req.method !== "GET" && req.method !== "PUT" && req.method !== "DELETE") {
            return res.status(405).json({ message: "Method Not Allowed" });
        }
        next();
    });

    app.all(`${API_URL_SMB}/:country/:date`, (req, res, next) => {
        if (req.method !== "GET" && req.method !== "PUT" && req.method !== "DELETE") {
            return res.status(405).json({ message: "Method Not Allowed" });
        }
        next();
    });

    //POST SMB
    app.post(API_URL_SMB, (req, res) => {

    let newWage = req.body;

    if (!newWage.country || !newWage.date) {
        return res.status(400).json({ message: "Missing fields" });
    }

    db.find({ country: newWage.country, date: newWage.date }, (err, docs) => {

        if (docs.length > 0) {
            return res.status(409).json({ message: "Resource already exists" });
        }

        db.insert(newWage, (err, newDoc) => {

            delete newDoc._id;

            res.status(201).json(newDoc);

         });

         });

    });

    // PUT SMB
    app.put(`${API_URL_SMB}/:country`, (req, res) => {

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
                    return res.status(404).json({});
                }

                res.status(200).json(body);

            }
        );
    });

    app.put(`${API_URL_SMB}/:country/:date`, (req, res) => {

        let country = req.params.country;
        let date = parseInt(req.params.date);
        let body = req.body;

        if (body.country !== country || body.date !== date) {
            return res.status(400).json({
                message: "El recurso del body debe coincidir con el de la URL"
            });
        }

        db.update(
            { country: country, date: date },
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
    // DELETE SMB

    app.delete(API_URL_SMB, (req, res) => {

        db.remove({}, { multi: true }, (err, numRemoved) => {

            res.sendStatus(204);

        });

    });

    app.delete(`${API_URL_SMB}/:country`, (req, res) => {

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

    app.delete(`${API_URL_SMB}/:country/:date`, (req, res) => {

        let country = req.params.country;
        let date = parseInt(req.params.date);

        db.remove(
            { country: country, date: date },
            {},
            (err, numRemoved) => {

                if (numRemoved === 0) {
                    return res.status(404).json({});
                }

                res.sendStatus(204);

            }
        );

    });

    // GET SMB
   app.get(API_URL_SMB, (req, res) => {

        let query = {};

        if (req.query.country) {
            query.country = req.query.country;
        }

        if (req.query.date) {
            query.date = parseInt(req.query.date);
        }

        if (req.query.national_currency_minimum_wage) {
            query.national_currency_minimum_wage = parseFloat(req.query.national_currency_minimum_wage);
        }

        if (req.query.nmw_on_dollar) {
            query.nmw_on_dollar = parseFloat(req.query.nmw_on_dollar);
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

    app.get(`${API_URL_SMB}/:country`, (req, res) => {

    let country = req.params.country;

    db.findOne({ country: country}, (err, doc) => {

        if (!doc) {
            return res.status(404).json({});
        }

        delete doc._id;

        res.status(200).json(doc);

    });
    });

    app.get(`${API_URL_SMB}/:country/:date`, (req, res) => {

    let country = req.params.country;
    let date = parseInt(req.params.date);

    db.findOne({ country: country, date: date }, (err, doc) => {

        if (!doc) {
            return res.status(404).json({});
        }

        delete doc._id;

        res.status(200).json(doc);

    });

    });
    //POST restriccion
    app.post("/:country", (req, res) => {
        return sendJson(res, 405, {error: "POST not allowed on /:country"});
    });
    //PUT restriccion
    app.put("/", (req, res) => {
        return sendJson(res, 405, {error: "PUT not allowed on /"});
    });
    }