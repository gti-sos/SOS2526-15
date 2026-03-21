import Datastore from 'nedb';
const API_URL_JAM_V2 = "/api/v2/happiness-indices";

export function loadBackendJAMv2(app) {
    const db = new Datastore(); 

    const initialData = [
        { country: "spain", year: 2023, "happiness-index": 6.436, "happiness-rank": 32, "happiness-score": 120.5 },
        { country: "finland", year: 2023, "happiness-index": 7.804, "happiness-rank": 1, "happiness-score": 150.2 }
    ];

    // GET /docs (v2) - Aquí pondrás tu nuevo enlace de Postman cuando lo tengas
    app.get(`${API_URL_JAM_V2}/docs`, (req, res) => {
        res.redirect("https://documenter.getpostman.com/view/TU_NUEVA_URL_V2");
    });

    // Rutas básicas (Listado, Creación, Borrado total)
    app.get(API_URL_JAM_V2, (req, res) => {
        db.find({}, (err, data) => {
            data.forEach(d => delete d._id);
            res.json(data);
        });
    });

    app.post(API_URL_JAM_V2, (req, res) => {
        let newData = req.body;
        db.insert(newData, (err, saved) => {
            if (err) return res.sendStatus(500);
            delete saved._id;
            res.status(201).json(saved);
        });
    });

    // Rutas para un recurso específico (Edición y Borrado individual)
    app.get(`${API_URL_JAM_V2}/:country/:year`, (req, res) => {
        db.findOne({ country: req.params.country, year: parseInt(req.params.year) }, (err, item) => {
            if (item) { delete item._id; res.json(item); }
            else res.sendStatus(404);
        });
    });

    app.put(`${API_URL_JAM_V2}/:country/:year`, (req, res) => {
        db.update({ country: req.params.country, year: parseInt(req.params.year) }, req.body, {}, (err, num) => {
            if (num === 1) res.status(200).json(req.body);
            else res.sendStatus(404);
        });
    });

    app.delete(`${API_URL_JAM_V2}/:country/:year`, (req, res) => {
        db.remove({ country: req.params.country, year: parseInt(req.params.year) }, {}, (err, num) => {
            if (num === 1) res.sendStatus(204);
            else res.sendStatus(404);
        });
    });
}