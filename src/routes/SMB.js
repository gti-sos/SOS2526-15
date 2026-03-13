// api rest SMB
const API_URL_SMB = "/api/v1/minimum-interprofessional-wages";
export function loadBackendSMB(app){
let minimumInterprofessionalWages = [];

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

        if (minimumInterprofessionalWages.length === 0) {
            minimumInterprofessionalWages = [...datosNmw]; 
            res.status(201).json(minimumInterprofessionalWages);
        } else {
            res.status(409).json({ message: "Los datos ya estaban cargados" });
        }
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
    });
    //POST SMB
    app.post(API_URL_SMB, (req, res) => {

        const newWage = req.body;

        if (!newWage.country || !newWage.date) {
            return res.status(400).json({ message: "Faltan campos obligatorios (country, date)" });
        }

        const exists = minimumInterprofessionalWages.find(d =>
            d.country === newWage.country &&
            d.date === newWage.date
        );

        if (exists) {
            return res.status(409).json({ message: "El recurso ya existe" });
        }

        minimumInterprofessionalWages.push(newWage);
        res.status(201).json(newWage);
    });

    // PUT SMB
    app.put(`${API_URL_SMB}/:country`, (req, res) => {

        const country = req.params.country;
        const body = req.body;
        
        if (body.country !== country) {
            return res.status(400).json({
                message: "El recurso del body debe coincidir con el de la URL"
            });
        }
        let updated = false;

        minimumInterprofessionalWages = minimumInterprofessionalWages.map(d => {

            if (d.country === country) {
                updated = true;
                return { ...d, ...req.body };
            }

            return d;
        });

        if (!updated) {
            return res.status(404).json({ message: "Country not found" });
        }

        res.status(200).json({ message: "Updated" });
    });

    app.put(`${API_URL_SMB}/:country/:date`, (req, res) => {

        const country = req.params.country;
        const date = parseInt(req.params.date);
        const body = req.body;
        
        if (body.country !== country || body.date !== date) {
            return res.status(400).json({
                message: "El recurso del body debe coincidir con el de la URL"
            });
        }
        const index = minimumInterprofessionalWages.findIndex(d =>
            d.country === country &&
            d.date === date
        );

        if (index === -1) {
            return res.status(404).json({ message: "Recurso no encontrado" });
        }

        minimumInterprofessionalWages[index] = req.body;

        res.status(200).json(req.body);
    });

    // DELETE SMB

    app.delete(API_URL_SMB, (req, res) => {

        minimumInterprofessionalWages = [];

        res.status(204).send();
    });

    app.delete(`${API_URL_SMB}/:country`, (req, res) => {

        const country = req.params.country;

        const filtered = minimumInterprofessionalWages.filter(d =>
            d.country !== country
        );

        if (filtered.length === minimumInterprofessionalWages.length) {
            return res.status(404).json({ message: "Country not found" });
        }

        minimumInterprofessionalWages = filtered;

        res.status(204).send();
    });

    app.delete(`${API_URL_SMB}/:country/:date`, (req, res) => {

        const country = req.params.country;
        const date = parseInt(req.params.date);

        const index = minimumInterprofessionalWages.findIndex(d =>
            d.country === country &&
            d.date === date
        );

        if (index === -1) {
            return res.status(404).json({ message: "Recurso no encontrado" });
        }

        minimumInterprofessionalWages.splice(index, 1);

        res.status(204).send(); // 204: No Content
    });

    // GET SMB
    app.get(API_URL_SMB, (req, res) => {

        let { country, date, from, to } = req.query;

        let results = minimumInterprofessionalWages;

        // Filtrar por country
        if (country) {
            results = results.filter(d => d.country === country);
        }

        // Filtrar por date exacta
        if (date) {
            results = results.filter(d => d.date === parseInt(date));
        }

        // Filtrar por rango
        if (from) {
            results = results.filter(d => d.date >= parseInt(from));
        }

        if (to) {
            results = results.filter(d => d.date <= parseInt(to));
        }

        // Si no hay resultados → devolver array vacío
        return res.status(200).json(results);
    });

    app.get(`${API_URL_SMB}/:country`, (req, res) => {

        const country = req.params.country;

        const results = minimumInterprofessionalWages.filter(d =>
            d.country === country
        );

        if (results.length === 0) {
            return res.status(404).json([]);
        }

        res.status(200).json(results);
    });

    app.get(`${API_URL_SMB}/:country/:date`, (req, res) => {

        const country = req.params.country;
        const date = parseInt(req.params.date);

        const result = minimumInterprofessionalWages.find(d =>
            d.country === country &&
            d.date === date
        );

        if (!result) {
            return res.status(404).json({});
        }

        return res.status(200).json(result);
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