require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 3000;

app.get('/pdf', (req, res) => res.send('test ok'))

app.use((req, res, next) => {
    res.status(200).json({
        message: 'It works!'
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))