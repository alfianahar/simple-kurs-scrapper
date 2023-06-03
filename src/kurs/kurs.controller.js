const kursService = require('./kurs.service');

async function remove(req, res, next) {
    try {
        res.json(await kursService.removeKurs(req.params.date));
    } catch (err) {
        console.error(`Error while getting Kurs`, err.message);
        next(err);
    }
}

async function get(req, res, next) {
    try {
        const { startdate, enddate } = req.query;
        res.json(await kursService.getKurs(startdate, enddate));
    } catch (err) {
        console.error(`Error while getting Kurs`, err.message);
        next(err);
    }
}

async function getSymbol(req, res, next) {
    try {
        const { symbol } = req.params;
        const { startdate, enddate } = req.query;
        res.json(await kursService.getKursBySymbol(symbol, startdate, enddate));
    } catch (err) {
        console.error(`Error while getting Kurs`, err.message);
        next(err);
    }
}

async function create(req, res, next) {
    try {
        const kursData = req.body;
        const result = await kursService.createKurs(kursData);
        res.json(result);
    } catch (err) {
        console.error(`Error while creating Kurs`, err.message);
        next(err);
    }
}

module.exports = {
    remove,
    get,
    getSymbol,
    create
}
