const db = require('../configs/db.config');
const { v4: uuidv4 } = require('uuid');

const removeKurs = async (date) => {
    // Delete records from ExchangeRate table
    const deleteExchangeRateQuery = 'DELETE FROM ExchangeRate WHERE DATE_FORMAT(createdDate, "%Y-%m-%d") = ?';
    const [exchangeRateResult] = await db.query(deleteExchangeRateQuery, [date]);
    const affectedRows = exchangeRateResult.affectedRows;

    if (affectedRows === 0) {
        throw new Error('No kurs found for the specified date.');
    }

    // Delete related records from ERate table
    const deleteERateQuery = 'DELETE FROM ERate WHERE erate_id NOT IN (SELECT erate_id FROM ExchangeRate)';
    await db.query(deleteERateQuery);

    // Delete related records from TTCounter table
    const deleteTTCounterQuery = 'DELETE FROM TTCounter WHERE tt_counter_id NOT IN (SELECT tt_counter_id FROM ExchangeRate)';
    await db.query(deleteTTCounterQuery);

    // Delete related records from BankNotes table
    const deleteBankNotesQuery = 'DELETE FROM BankNotes WHERE bank_notes_id NOT IN (SELECT bank_notes_id FROM ExchangeRate)';
    await db.query(deleteBankNotesQuery);

    return { message: 'Records deleted successfully.' };
}

const getKurs = async (startdate, enddate) => {

    try {
        const query = `
      SELECT
        Currency.symbol AS symbol,
        ERate.jual AS e_rate_jual,
        ERate.beli AS e_rate_beli,
        TTCounter.jual AS tt_counter_jual,
        TTCounter.beli AS tt_counter_beli,
        BankNotes.jual AS bank_notes_jual,
        BankNotes.beli AS bank_notes_beli,
        DATE_FORMAT(ExchangeRate.createdDate, "%Y-%m-%d") AS date
      FROM ExchangeRate
      INNER JOIN Currency ON Currency.currency_id = ExchangeRate.currency_id
      INNER JOIN ERate ON ERate.erate_id = ExchangeRate.erate_id
      INNER JOIN TTCounter ON TTCounter.tt_counter_id = ExchangeRate.tt_counter_id
      INNER JOIN BankNotes ON BankNotes.bank_notes_id = ExchangeRate.bank_notes_id
      WHERE ExchangeRate.createdDate >= ? AND ExchangeRate.createdDate <= ?
    `;
        const [results] = await db.query(query, [startdate, enddate]);

        const data = results.map((result) => ({
            symbol: result.symbol,
            e_rate: {
                jual: result.e_rate_jual,
                beli: result.e_rate_beli,
            },
            tt_counter: {
                jual: result.tt_counter_jual,
                beli: result.tt_counter_beli,
            },
            bank_notes: {
                jual: result.bank_notes_jual,
                beli: result.bank_notes_beli,
            },
            date: result.date,
        }));


        return data


    } catch (error) {
        console.error(error);
        throw new Error('An error occurred while fetching the records.');
    }
}

const getKursBySymbol = async (symbol, startdate, enddate) => {
    try {
        const query = `
      SELECT
        Currency.symbol AS symbol,
        ERate.jual AS e_rate_jual,
        ERate.beli AS e_rate_beli,
        TTCounter.jual AS tt_counter_jual,
        TTCounter.beli AS tt_counter_beli,
        BankNotes.jual AS bank_notes_jual,
        BankNotes.beli AS bank_notes_beli,
        DATE_FORMAT(ExchangeRate.createdDate, "%Y-%m-%d") AS date
      FROM ExchangeRate
      INNER JOIN Currency ON Currency.currency_id = ExchangeRate.currency_id
      INNER JOIN ERate ON ERate.erate_id = ExchangeRate.erate_id
      INNER JOIN TTCounter ON TTCounter.tt_counter_id = ExchangeRate.tt_counter_id
      INNER JOIN BankNotes ON BankNotes.bank_notes_id = ExchangeRate.bank_notes_id
      WHERE Currency.symbol = ? AND ExchangeRate.createdDate >= ? AND ExchangeRate.createdDate <= ?
    `;
        const [results] = await db.query(query, [symbol, startdate, enddate]);

        const data = results.map((result) => ({
            symbol: result.symbol,
            e_rate: {
                jual: result.e_rate_jual,
                beli: result.e_rate_beli,
            },
            tt_counter: {
                jual: result.tt_counter_jual,
                beli: result.tt_counter_beli,
            },
            bank_notes: {
                jual: result.bank_notes_jual,
                beli: result.bank_notes_beli,
            },
            date: result.date,
        }));


        return data


    } catch (error) {
        console.error(error);
        throw new Error('An error occurred while fetching the records.');
    }
}

const createKurs = async (kursData) => {
    const { symbol, e_rate, tt_counter, bank_notes, date } = kursData;

    const getCurrencyId = async (symbol) => {
        const checkQuery = 'SELECT currency_id FROM Currency WHERE LOWER(symbol) = LOWER(?)';
        const [checkResult] = await db.query(checkQuery, [symbol.toLowerCase()]);

        if (checkResult.length > 0) {
            return checkResult[0].currency_id;
        } else {
            const currencyId = uuidv4();
            const currencyQuery = 'INSERT INTO Currency (currency_id, symbol) VALUES (?, ?)';
            await db.query(currencyQuery, [currencyId, symbol]);

            return currencyId;
        }
    };

    const insertRate = async (table, column, rateId, jual, beli) => {
        const query = `INSERT INTO ${table} (${column}, jual, beli) VALUES (?, ?, ?)`;
        await db.query(query, [rateId, jual, beli]);
    };

    try {
        const currencyId = await getCurrencyId(symbol);

        // Check if data already exists for the given symbol and date
        const checkDataQuery = 'SELECT COUNT(*) AS count FROM ExchangeRate WHERE currency_id = ? AND DATE_FORMAT(createdDate, "%Y-%m-%d") = ?';
        const [checkDataResult] = await db.query(checkDataQuery, [currencyId, date]);

        if (checkDataResult[0].count > 0) {
            return { message: 'Data already exists for the given symbol and date.' };
        }

        const exchangeRateId = uuidv4();
        const eRateId = uuidv4();
        const ttCounterId = uuidv4();
        const bankNotesId = uuidv4();

        // Insert data into ERate table
        await insertRate('ERate', 'erate_id', eRateId, e_rate.jual, e_rate.beli);

        // Insert data into TTCounter table
        await insertRate('TTCounter', 'tt_counter_id', ttCounterId, tt_counter.jual, tt_counter.beli);

        // Insert data into BankNotes table
        await insertRate('BankNotes', 'bank_notes_id', bankNotesId, bank_notes.jual, bank_notes.beli);

        // Insert data into ExchangeRate table
        const exchangeRateQuery = 'INSERT INTO ExchangeRate (exchange_rate_id, currency_id, erate_id, tt_counter_id, bank_notes_id, createdDate) VALUES (?, ?, ?, ?, ?, ?)';
        await db.query(exchangeRateQuery, [exchangeRateId, currencyId, eRateId, ttCounterId, bankNotesId, date]);

        return {
            symbol: symbol,
            e_rate: {
                jual: e_rate.jual,
                beli: e_rate.beli
            },
            tt_counter: {
                jual: tt_counter.jual,
                beli: tt_counter.beli
            },
            bank_notes: {
                jual: bank_notes.jual,
                beli: bank_notes.beli
            },
            date: date
        };
    } catch (error) {
        console.error(error);
        throw new Error('An error occurred while creating Kurs data.');
    }
};

const updateKurs = async (kursData) => {
    const { symbol, e_rate, tt_counter, bank_notes, date } = kursData;

    const getCurrencyId = async (symbol) => {
        const checkQuery = 'SELECT currency_id FROM Currency WHERE LOWER(symbol) = LOWER(?)';
        const [checkResult] = await db.query(checkQuery, [symbol.toLowerCase()]);

        if (checkResult.length > 0) {
            return checkResult[0].currency_id;
        } else {
            const currencyId = uuidv4();
            const currencyQuery = 'INSERT INTO Currency (currency_id, symbol) VALUES (?, ?)';
            await db.query(currencyQuery, [currencyId, symbol]);

            return currencyId;
        }
    };

    const insertRate = async (table, column, rateId, jual, beli) => {
        const query = `INSERT INTO ${table} (${column}, jual, beli) VALUES (?, ?, ?)`;
        await db.query(query, [rateId, jual, beli]);
    };

    const currencyId = await getCurrencyId(symbol);

    // Check if data already exists for the given symbol and date
    const checkDataQuery = 'SELECT COUNT(*) AS count FROM ExchangeRate WHERE currency_id = ? AND DATE_FORMAT(createdDate, "%Y-%m-%d") = ?';
    const [checkDataResult] = await db.query(checkDataQuery, [currencyId, date]);

    if (checkDataResult[0].count === 0) {
        throw new Error('Data not found for the given symbol and date.');
    }

    const exchangeRateId = uuidv4();
    const eRateId = uuidv4();
    const ttCounterId = uuidv4();
    const bankNotesId = uuidv4();

    // Insert data into ERate table
    await insertRate('ERate', 'erate_id', eRateId, e_rate.jual, e_rate.beli);

    // Insert data into TTCounter table
    await insertRate('TTCounter', 'tt_counter_id', ttCounterId, tt_counter.jual, tt_counter.beli);

    // Insert data into BankNotes table
    await insertRate('BankNotes', 'bank_notes_id', bankNotesId, bank_notes.jual, bank_notes.beli);

    // Update data in ExchangeRate table
    const updateQuery = `
      UPDATE ExchangeRate
      SET erate_id = ?, tt_counter_id = ?, bank_notes_id = ?, createdDate = ?
      WHERE currency_id = ? AND DATE_FORMAT(createdDate, "%Y-%m-%d") = ?`;
    await db.query(updateQuery, [eRateId, ttCounterId, bankNotesId, date, currencyId, date]);

    return {
        symbol: symbol,
        e_rate: {
            jual: e_rate.jual,
            beli: e_rate.beli
        },
        tt_counter: {
            jual: tt_counter.jual,
            beli: tt_counter.beli
        },
        bank_notes: {
            jual: bank_notes.jual,
            beli: bank_notes.beli
        },
        date: date
    };
};

module.exports = {
    removeKurs,
    getKurs,
    getKursBySymbol,
    createKurs,
    updateKurs
}