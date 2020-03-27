const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'handler get request to /pdf'
    });
});

router.post('/', (req, res, next) => {
    const content = req.body;
    console.log (content);
    if (content) {
        //pdf build
        res.status(200).json({
            message: 'check the output.pdf'
        });
    }else{
        res.status(200).json({
            message: 'body not found'
        });
    }

    res.status(200).json({
        message: 'handler post request to /pdf'
    });
});


module.exports = router;

// router.post('/', (req, res, next) => {
//     res.status(200).json({
//         message: 'handle post request to /pdf'
//     });
// });