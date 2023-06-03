const kursService = require('./kurs.service');

async function remove(req, res, next) {
    try {
        res.json(await kursService.removeKurs(req.params.date));
    } catch (err) {
        console.error(`Error while getting Kurs`, err.message);
        next(err);
    }
}

module.exports = {
    remove,
};
