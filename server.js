require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 7000;

// Import routes
const indexingRoutes = require('./routes/indexing');
// const kursRoutes = require('./routes/kurs');

// Middleware
app.use(express.json());

// Routes
app.get('/api/indexing', indexingRoutes.getIndexing);
// app.use('/api/kurs', kursRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
