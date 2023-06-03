require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 7000;

// Import routes
const indexingRouter = require('./src/indexing/indexing.route');
const kursRouter = require('./src/kurs/kurs.route');

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({ 'message': 'ok' });
})

// Routes
app.use('/api', indexingRouter);
app.use('/api', kursRouter);

// Middleware
app.use(express.json());

// Error handler middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ 'message': err.message });

    return;
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
