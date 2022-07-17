const express = require('express');
const router = express.Router();
const Stock = require('../models/stockModel');
const User = require('../models/userModel')

router.get('/user/', async (req, res) => {
    const stockUser = await Stock.find({ranch_owner: req.user.ranch});
    // console.log('El usuario tiene: ' + stockUser);
    res.render('user/userhome', {
        doc_title: 'Usuario',
        stockUser
    });
});


module.exports = router;