const axios = require('axios');
const cheerio = require('cheerio');
const { v4: uuidv4 } = require('uuid');
const sqlConnection = require('../config/dbConfig');

// GET /api/indexing
const getIndexing = async (req, res) => {
    const url = 'https://www.bca.co.id/id/informasi/kurs';

    axios.get(url)
        .then(response => {
            const $ = cheerio.load(response.data);
            const tableRows = $('.m-table-kurs tbody tr');

            const data = [];

            tableRows.each(async (index, element) => {
                const currencyCode = $(element).attr('code');
                const eRateBuy = parseFloat($(element).find('[rate-type="ERate-buy"]').text().replace('.', '').replace(',', '.'));
                const eRateSell = parseFloat($(element).find('[rate-type="ERate-sell"]').text().replace('.', '').replace(',', '.'));
                const ttBuy = parseFloat($(element).find('[rate-type="TT-buy"]').text().replace('.', '').replace(',', '.'));
                const ttSell = parseFloat($(element).find('[rate-type="TT-sell"]').text().replace('.', '').replace(',', '.'));
                const bnBuy = parseFloat($(element).find('[rate-type="BN-buy"]').text().replace('.', '').replace(',', '.'));
                const bnSell = parseFloat($(element).find('[rate-type="BN-sell"]').text().replace('.', '').replace(',', '.'));
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

                try {
                    // Check if symbol already exists in Currency table
                    const checkQuery = 'SELECT COUNT(*) AS count FROM Currency WHERE symbol = ?';
                    const [checkResult] = await sqlConnection.query(checkQuery, [currencyCode]);

                    if (checkResult.length > 0) {
                        const currencyId = checkResult[0].currency_id;
                        const exchangeRateId = uuidv4();
                        const eRateId = uuidv4();
                        const ttCounterId = uuidv4();
                        const bankNotesId = uuidv4();

                        // Insert data into ERate table
                        const eRateQuery = 'INSERT INTO ERate (erate_id, jual, beli) VALUES (?, ?, ?)';
                        await sqlConnection.query(eRateQuery, [eRateId, eRateSell, eRateBuy]);

                        // Insert data into TTCounter table
                        const ttCounterQuery = 'INSERT INTO TTCounter (tt_counter_id, jual, beli) VALUES (?, ?, ?)';
                        await sqlConnection.query(ttCounterQuery, [ttCounterId, ttSell, ttBuy]);

                        // Insert data into BankNotes table
                        const bankNotesQuery = 'INSERT INTO BankNotes (bank_notes_id, jual, beli) VALUES (?, ?, ?)';
                        await sqlConnection.query(bankNotesQuery, [bankNotesId, bnSell, bnBuy]);

                        // Insert data into ExchangeRate table
                        const exchangeRateQuery = 'INSERT INTO ExchangeRate (exchange_rate_id, currency_id, erate_id, tt_counter_id, bank_notes_id, createdDate) VALUES (?, ?, ?, ?, ?, ?)';
                        await sqlConnection.query(exchangeRateQuery, [exchangeRateId, currencyId, eRateId, ttCounterId, bankNotesId, date]);

                        // Continue with other operations or processing if needed

                    } else {
                        // Symbol doesn't exist in Currency table, handle the case accordingly
                        console.log(`Symbol ${currencyCode} does not exist in Currency table.`);
                    }

                    // // Insert exchange rates into ERate, TTCounter, and BankNotes tables
                    // const erateQuery = `INSERT INTO ERate (erate_id, jual, beli) VALUES (?, ?, ?)`;
                    // const ttCounterQuery = `INSERT INTO TTCounter (tt_counter_id, jual, beli) VALUES (?, ?, ?)`;
                    // const bankNotesQuery = `INSERT INTO BankNotes (bank_notes_id, jual, beli) VALUES (?, ?, ?)`;
                    // const [erateResult] = await sqlConnection.query(erateQuery, [currencyCode, eRateSell, eRateBuy]);
                    // const [ttCounterResult] = await sqlConnection.query(ttCounterQuery, [currencyCode, ttSell, ttBuy]);
                    // const [bankNotesResult] = await sqlConnection.query(bankNotesQuery, [currencyCode, bnSell, bnBuy]);

                    // // Insert exchange rate data into ExchangeRate table
                    // const exchangeRateQuery = `INSERT INTO ExchangeRate (exchange_rate_id, currency_id, erate_id, tt_counter_id, bank_notes_id, createdDate) VALUES (?, ?, ?, ?, ?, ?)`;
                    // await sqlConnection.query(exchangeRateQuery, [uuidv4(), currencyCode, erateResult.insertId, ttCounterResult.insertId, bankNotesResult.insertId, date]);


                } catch (error) {
                    console.error(error);
                    res.status(500).send('An error occurred while inserting data into the database.');
                }
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
};
