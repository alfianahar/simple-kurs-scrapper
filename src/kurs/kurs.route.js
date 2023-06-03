const express = require('express');
const router = express.Router();
const kursController = require('./kurs.controller');

router.delete('/kurs/:date', kursController.remove);

module.exports = router;
