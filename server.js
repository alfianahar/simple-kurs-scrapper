const express = require('express');
const app = express();

// Import routes
const indexingRoutes = require('./routes/indexing');
// const kursRoutes = require('./routes/kurs');

// Middleware
app.use(express.json());

// Routes
app.use('/api/indexing', indexingRoutes.getIndexing);
// app.use('/api/kurs', kursRoutes);

// Start the server
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
