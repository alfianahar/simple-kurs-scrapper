const kursService = require('./kurs.service');

async function get(req, res, next) {
    try {
        res.json(await kursService.getKurs(req.query.page));
    } catch (err) {
        console.error(`Error while getting Kurs`, err.message);
        next(err);
    }
}

module.exports = {
    get,
};
