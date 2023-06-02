const axios = require('axios');
const cheerio = require('cheerio');
const { v4: uuidv4 } = require('uuid');
const sqlConnection = require('../config/dbConfig');

// GET /api/indexing
const getIndexing = async (req, res) => {
    const url = 'https://www.bca.co.id/id/informasi/kurs';

    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    try {
        // Check if data for the current date already exists in ExchangeRate table
        const checkDateQuery = 'SELECT COUNT(*) AS count FROM ExchangeRate WHERE createdDate = ?';
        const [checkDateResult] = await sqlConnection.query(checkDateQuery, [currentDate]);

        if (checkDateResult[0].count > 0) {
            return res.status(200).json({ message: 'Data for the current date already exists.' });
        }

        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const tableRows = $('.m-table-kurs tbody tr');

        const data = [];

        for (let i = 0; i < tableRows.length; i++) {
            const currencyCode = $(tableRows[i]).attr('code');
            const eRateBuy = parseFloat($(tableRows[i]).find('[rate-type="ERate-buy"]').text().replace('.', '').replace(',', '.'));
            const eRateSell = parseFloat($(tableRows[i]).find('[rate-type="ERate-sell"]').text().replace('.', '').replace(',', '.'));
            const ttBuy = parseFloat($(tableRows[i]).find('[rate-type="TT-buy"]').text().replace('.', '').replace(',', '.'));
            const ttSell = parseFloat($(tableRows[i]).find('[rate-type="TT-sell"]').text().replace('.', '').replace(',', '.'));
            const bnBuy = parseFloat($(tableRows[i]).find('[rate-type="BN-buy"]').text().replace('.', '').replace(',', '.'));
            const bnSell = parseFloat($(tableRows[i]).find('[rate-type="BN-sell"]').text().replace('.', '').replace(',', '.'));

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
                date: currentDate
            };

            data.push(formattedData);
        }

        for (const item of data) {
            try {
                const currencyCode = item.symbol;

                // Check if symbol already exists in Currency table (case-insensitive comparison)
                const checkQuery = 'SELECT currency_id FROM Currency WHERE LOWER(symbol) = LOWER(?)';
                const [checkResult] = await sqlConnection.query(checkQuery, [currencyCode.toLowerCase()]);

                if (checkResult.length > 0) {
                    const currencyId = checkResult[0].currency_id;
                    const exchangeRateId = uuidv4();
                    const eRateId = uuidv4();
                    const ttCounterId = uuidv4();
                    const bankNotesId = uuidv4();

                    // Insert data into ERate table
                    const eRateQuery = 'INSERT INTO ERate (erate_id, jual, beli) VALUES (?, ?, ?)';
                    await sqlConnection.query(eRateQuery, [eRateId, item.e_rate.jual, item.e_rate.beli]);

                    // Insert data into TTCounter table
                    const ttCounterQuery = 'INSERT INTO TTCounter (tt_counter_id, jual, beli) VALUES (?, ?, ?)';
                    await sqlConnection.query(ttCounterQuery, [ttCounterId, item.tt_counter.jual, item.tt_counter.beli]);

                    // Insert data into BankNotes table
                    const bankNotesQuery = 'INSERT INTO BankNotes (bank_notes_id, jual, beli) VALUES (?, ?, ?)';
                    await sqlConnection.query(bankNotesQuery, [bankNotesId, item.bank_notes.jual, item.bank_notes.beli]);

                    // Insert data into ExchangeRate table
                    const exchangeRateQuery = 'INSERT INTO ExchangeRate (exchange_rate_id, currency_id, erate_id, tt_counter_id, bank_notes_id, createdDate) VALUES (?, ?, ?, ?, ?, ?)';
                    await sqlConnection.query(exchangeRateQuery, [exchangeRateId, currencyId, eRateId, ttCounterId, bankNotesId, currentDate]);

                } else {
                    // Symbol doesn't exist in Currency table, handle the case accordingly
                    console.log(`Symbol ${currencyCode} does not exist in Currency table.`);
                }
            } catch (error) {
                console.error(error);
                return res.status(500).send('An error occurred while inserting data into the database.');
            }
        }
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).send('An error occurred while scraping the data.');
    }
};

module.exports = {
    getIndexing: getIndexing
};
