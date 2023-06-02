const express = require('express');
const router = express.Router();
const kursController = require('../controllers/kursController');

// DELETE /api/kurs/:date
router.delete('/:date', kursController.deleteKursByDate);

// GET /api/kurs?startdate=:startdate&enddate=:enddate
router.get('/', kursController.getKursByDateRange);

// GET /api/kurs/:symbol?startdate=:startdate&enddate=:enddate
router.get('/:symbol', kursController.getKursBySymbolAndDateRange);

// POST /api/kurs
router.post('/', kursController.createKurs);

// PUT /api/kurs
router.put('/', kursController.updateKurs);

module.exports = router;
