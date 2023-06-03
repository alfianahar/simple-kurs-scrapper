const db = require('../configs/db.config');

const removeKurs = async (date) => {
    try {
        // Delete records from ExchangeRate table
        const deleteExchangeRateQuery = 'DELETE FROM ExchangeRate WHERE DATE_FORMAT(createdDate, "%Y-%m-%d") = ?';
        await db.query(deleteExchangeRateQuery, [date]);

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

    } catch (error) {
        console.error(error);
        throw new Error('An error occurred while deleting the records.');
    }

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
    console.log(symbol, startdate, enddate)

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



module.exports = {
    removeKurs,
    getKurs,
    getKursBySymbol
}