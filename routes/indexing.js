const axios = require('axios');
const cheerio = require('cheerio');

// GET /api/indexing
const getIndexing = async (req, res) => {
    try {
        // Scrape the table from the URL
        const url = 'https://www.bca.co.id/id/informasi/kurs';
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Extract table data
        const tableData = [];
        $('table.table > tbody > tr').each((index, element) => {
            const columns = $(element)
                .find('td')
                .map((i, el) => $(el).text().trim())
                .get();
            tableData.push(columns);
        });

        // Return the scraped table data
        res.json(tableData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while scraping the table.' });
    }
};

module.exports = {
    getIndexing: getIndexing
}