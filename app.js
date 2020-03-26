const express = require('express');
const app = express();

const pdfRoutes = require('./api/routes/pdf');


app.use('/pdf', pdfRoutes);

app.use((req, res, next) => {
    res.status(200).json({
        message: 'It works!'
    });
});

module.exports = app;