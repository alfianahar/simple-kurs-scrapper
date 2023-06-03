const kursService = require('./kurs.service');

async function remove(req, res, next) {
    try {
        const result = await kursService.removeKurs(req.params.date);
        return res.json(result);
    } catch (err) {
        console.error(`An error occurred while deleting kuurs`, err.message);
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
        console.error(`Error while getting Kurs using symbol`, err.message);
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

async function update(req, res, next) {
    try {
        const kursData = req.body;
        const result = await kursService.updateKurs(kursData);
        if (result.error) {
            res.status(404).json({ message: result.error });
        } else {
            res.json(result);
        }
    } catch (err) {
        console.error(`Error while updating Kurs`, err.message);
        next(err);
    }
}

module.exports = {
    remove,
    get,
    getSymbol,
    create,
    update
}
