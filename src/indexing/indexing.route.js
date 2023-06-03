const express = require('express');
const router = express.Router();
const indexingController = require('./indexing.controller');

router.get('/indexing', indexingController.get);

module.exports = router;
