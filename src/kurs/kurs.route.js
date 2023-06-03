const express = require('express');
const router = express.Router();
const kursController = require('./kurs.controller');

router.delete('/kurs/:date', kursController.remove);

router.get('/kurs', kursController.get);

router.get('/kurs/:symbol', kursController.getSymbol);

router.post('/kurs', kursController.create);

router.put('/kurs/', kursController.update);

module.exports = router;
