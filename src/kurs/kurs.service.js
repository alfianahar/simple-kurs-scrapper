const axios = require('axios');
const cheerio = require('cheerio');
const { v4: uuidv4 } = require('uuid');
const db = require('../configs/db.config');

const getKurs = async (req, res) => {
    const currentDate = new Date().toISOString().split('T')[0];

    return { currentDate };
}

module.exports = {
    getKurs
}