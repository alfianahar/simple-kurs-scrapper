const indexingService = require('./indexing.service');

async function get(req, res) {
    try {
        const data = await indexingService.getIndexing();
        res.json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).send('An error occurred while processing the request.');
    }

}

module.exports = {
    get,
};
