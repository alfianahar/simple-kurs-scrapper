const axios = require('axios');
const cheerio = require('cheerio');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db.config');

const getIndexing = async () => {
    const url = 'https://www.bca.co.id/id/informasi/kurs';

    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    try {
        // Check if data for the current date already exists in ExchangeRate table
        const checkDateQuery = 'SELECT COUNT(*) AS count FROM ExchangeRate WHERE createdDate = ?';
        const [checkDateResult] = await db.query(checkDateQuery, [currentDate]);

        if (checkDateResult[0].count > 0) {
            return { message: 'Data for the current date already exists.' };
        }

        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const tableRows = $('.m-table-kurs tbody tr');

        const data = [];

        const parseTableCell = ($row, rateType) => parseFloat(
            $row
                .find(`[rate-type="${rateType}"]`)
                .text()
                .replace('.', '')
                .replace(',', '.')
        );

        for (let i = 0; i < tableRows.length; i++) {
            const currencyCode = $(tableRows[i]).attr('code');
            const eRateBuy = parseTableCell($(tableRows[i]), 'ERate-buy');
            const eRateSell = parseTableCell($(tableRows[i]), 'ERate-sell');
            const ttBuy = parseTableCell($(tableRows[i]), 'TT-buy');
            const ttSell = parseTableCell($(tableRows[i]), 'TT-sell');
            const bnBuy = parseTableCell($(tableRows[i]), 'BN-buy');
            const bnSell = parseTableCell($(tableRows[i]), 'BN-sell');


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
                const [checkResult] = await db.query(checkQuery, [currencyCode.toLowerCase()]);

                if (checkResult.length > 0) {
                    const currencyId = checkResult[0].currency_id;
                    const exchangeRateId = uuidv4();
                    const eRateId = uuidv4();
                    const ttCounterId = uuidv4();
                    const bankNotesId = uuidv4();

                    // Insert data into ERate table
                    const eRateQuery = 'INSERT INTO ERate (erate_id, jual, beli) VALUES (?, ?, ?)';
                    await db.query(eRateQuery, [eRateId, item.e_rate.jual, item.e_rate.beli]);

                    // Insert data into TTCounter table
                    const ttCounterQuery = 'INSERT INTO TTCounter (tt_counter_id, jual, beli) VALUES (?, ?, ?)';
                    await db.query(ttCounterQuery, [ttCounterId, item.tt_counter.jual, item.tt_counter.beli]);

                    // Insert data into BankNotes table
                    const bankNotesQuery = 'INSERT INTO BankNotes (bank_notes_id, jual, beli) VALUES (?, ?, ?)';
                    await db.query(bankNotesQuery, [bankNotesId, item.bank_notes.jual, item.bank_notes.beli]);

                    // Insert data into ExchangeRate table
                    const exchangeRateQuery = 'INSERT INTO ExchangeRate (exchange_rate_id, currency_id, erate_id, tt_counter_id, bank_notes_id, createdDate) VALUES (?, ?, ?, ?, ?, ?)';
                    await db.query(exchangeRateQuery, [exchangeRateId, currencyId, eRateId, ttCounterId, bankNotesId, currentDate]);

                } else {
                    // If symbol doesn't exist in Currency table,
                    console.log(`Symbol ${currencyCode} does not exist in Currency table.`);
                }
            } catch (error) {
                console.error(error);
                throw new Error('An error occurred while inserting data into the database.');
            }
        }
        return data;
    } catch (error) {
        console.error(error);
        throw new Error('An error occurred while scraping the data.');

    }
};

module.exports = {
    getIndexing
};
