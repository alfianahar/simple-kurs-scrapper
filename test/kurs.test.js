const request = require('supertest');
const sinon = require('sinon');
const assert = require('assert');
const app = require('../server');
const kursController = require('../src/kurs/kurs.controller');
const kursService = require('../src/kurs/kurs.service');

describe('Kurs API', () => {
    describe('DELETE /api/kurs/:date', () => {
        it('should remove kurs records for the given date', async () => {
            const removeKursStub = sinon.stub(kursService, 'removeKurs');
            removeKursStub.resolves({ message: 'Records deleted successfully.' });

            const response = await request(app).delete('/api/kurs/2023-06-03');

            assert.strictEqual(response.status, 200);
            assert.deepStrictEqual(response.body, { message: 'Records deleted successfully.' });

            removeKursStub.restore();
        });

        // it('should handle errors during kurs removal', async () => {
        //     const errorMessage = 'An error occurred while deleting the records.';
        //     const removeKursStub = sinon.stub(kursService, 'removeKurs');
        //     removeKursStub.rejects(new Error(errorMessage));

        //     const response = await request(app).delete('/api/kurs/2021-06-02');

        //     assert.strictEqual(response.status, 500);
        //     assert.strictEqual(response.body.error, errorMessage);

        //     removeKursStub.restore();
        // });
    });

    describe('GET /api/kurs', () => {
        it('should get kurs records within the specified date range', async () => {
            const getKursStub = sinon.stub(kursService, 'getKurs');
            getKursStub.resolves([
                {
                    symbol: 'USD',
                    e_rate: { jual: 14000, beli: 13700 },
                    tt_counter: { jual: 13900, beli: 13600 },
                    bank_notes: { jual: 13800, beli: 13500 },
                    date: '2023-06-01',
                },
            ]);

            const response = await request(app).get('/api/kurs').query({
                startdate: '2023-06-01',
                enddate: '2023-06-02',
            });

            assert.strictEqual(response.status, 200);
            assert.deepStrictEqual(response.body, [
                {
                    symbol: 'USD',
                    e_rate: { jual: 14000, beli: 13700 },
                    tt_counter: { jual: 13900, beli: 13600 },
                    bank_notes: { jual: 13800, beli: 13500 },
                    date: '2023-06-01',
                },
            ]);

            getKursStub.restore();
        });

        // it('should handle errors during kurs retrieval', async () => {
        //     const errorMessage = 'An error occurred while fetching the records.';
        //     const getKursStub = sinon.stub(kursService, 'getKurs');
        //     getKursStub.rejects(new Error(errorMessage));

        //     const response = await request(app).get('/api/kursvvv').query({
        //         startdate: '2023-06-01',
        //         enddate: '2023-06-02',
        //     });

        //     assert.strictEqual(response.status, 404);
        //     assert.strictEqual(response.body.error, errorMessage);

        //     getKursStub.restore();
        // });
    });

    describe('GET /api/kurs/:symbol', () => {
        it('should get kurs records for the given symbol and date range', async () => {
            const getKursBySymbolStub = sinon.stub(kursService, 'getKursBySymbol');
            getKursBySymbolStub.resolves([
                {
                    symbol: 'USD',
                    e_rate: { jual: 14000, beli: 13700 },
                    tt_counter: { jual: 13900, beli: 13600 },
                    bank_notes: { jual: 13800, beli: 13500 },
                    date: '2023-06-01',
                },
            ]);

            const response = await request(app).get('/api/kurs/USD').query({
                startdate: '2023-06-01',
                enddate: '2023-06-02',
            });

            assert.strictEqual(response.status, 200);
            assert.deepStrictEqual(response.body, [
                {
                    symbol: 'USD',
                    e_rate: { jual: 14000, beli: 13700 },
                    tt_counter: { jual: 13900, beli: 13600 },
                    bank_notes: { jual: 13800, beli: 13500 },
                    date: '2023-06-01',
                },
            ]);

            getKursBySymbolStub.restore();
        });

        // it('should handle errors during kurs retrieval by symbol', async () => {
        //     const errorMessage = 'An error occurred while fetching the records.';
        //     const getKursBySymbolStub = sinon.stub(kursService, 'getKursBySymbol');
        //     getKursBySymbolStub.rejects(new Error(errorMessage));

        //     const response = await request(app).get('/kurs/USD').query({
        //         startdate: '2023-06-01',
        //         enddate: '2023-06-02',
        //     });

        //     assert.strictEqual(response.status, 404);
        //     assert.strictEqual(response.body.error, errorMessage);

        //     getKursBySymbolStub.restore();
        // });
    });

    // Add more describe blocks for other API endpoints and corresponding tests

});

