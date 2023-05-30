const axios = require('axios');
const cheerio = require('cheerio');

// GET /api/indexing
const getIndexing = async (req, res) => {
    const url = 'https://www.bca.co.id/id/informasi/kurs';

    axios.get(url)
        .then(response => {
            const $ = cheerio.load(response.data);
            const tableRows = $('.m-table-kurs tbody tr');

            const data = [];

            tableRows.each((index, element) => {
                const currencyCode = $(element).attr('code');
                const eRateBuy = parseFloat($(element).find('[rate-type="ERate-buy"]').text());
                const eRateSell = parseFloat($(element).find('[rate-type="ERate-sell"]').text());
                const ttBuy = parseFloat($(element).find('[rate-type="TT-buy"]').text());
                const ttSell = parseFloat($(element).find('[rate-type="TT-sell"]').text());
                const bnBuy = parseFloat($(element).find('[rate-type="BN-buy"]').text());
                const bnSell = parseFloat($(element).find('[rate-type="BN-sell"]').text());
                const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format



                const formattedData = {
                    symbol: currencyCode,
                    e_rate: {
                        jual: eRateSell,
                        beli: eRateBuy
                    },
                    tt_counter: {
                        jual: ttSell,
                        beli: ttBuy
                    },
                    bank_notes: {
                        jual: bnSell,
                        beli: bnBuy
                    },
                    date: date
                };

                data.push(formattedData);
            });

            res.json(data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('An error occurred while scraping the data.');
        });

};

module.exports = {
    getIndexing: getIndexing
}