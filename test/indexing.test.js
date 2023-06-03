const request = require('supertest');
const sinon = require('sinon');
const assert = require('assert');
const app = require('../server');
const indexingService = require('../src/indexing/indexing.service');

describe('Indexing API', () => {
    let getIndexingStub;

    before(() => {
        getIndexingStub = sinon.stub(indexingService, 'getIndexing');
    });

    after(() => {
        getIndexingStub.restore();
    });

    it('should return a list of indexed items', (done) => {
        const mockData = [
            {
                symbol: 'AAA',
                e_rate: {
                    jual: 1803.55,
                    beli: 1773.55,
                },
                tt_counter: {
                    jual: 1803.55,
                    beli: 1773.55,
                },
                bank_notes: {
                    jual: 1803.55,
                    beli: 1773.55,
                },
                date: '2018-05-17',
            },
        ];
        getIndexingStub.resolves(mockData);

        request(app)
            .get('/api/indexing')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                assert.deepEqual(res.body, mockData);
                done();
            });
    });
});
