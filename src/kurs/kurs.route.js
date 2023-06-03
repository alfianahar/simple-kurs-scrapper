const express = require('express');
const router = express.Router();
const kursController = require('./kurs.controller');

router.delete('/kurs/:date', kursController.remove);

router.get('/kurs', kursController.get);

module.exports = router;
