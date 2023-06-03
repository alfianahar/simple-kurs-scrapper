const db = require('../configs/db.config');

const removeKurs = async (date) => {
    console.log(date)

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

module.exports = {
    removeKurs
}