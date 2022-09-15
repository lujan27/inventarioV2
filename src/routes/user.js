const express = require('express');
const router = express.Router();
const User = require('../models/users/userModel');
const Ranch = require('../models/ranchModel');
const Stock = require('../models/stockModel');
const { isAuthUser } = require('../config/sessionUser');

router.get('/user', isAuthUser, async (req, res) => {
    const ranches = await Ranch.aggregate([
        {
            '$match': {
                ranch_name: {$ne: 'Rancho Principal'}
            }
        }
    ]);
    const usuarios = await User.aggregate([
        {
            '$lookup': {
                'from': 'ranches',
                'localField': 'ranch',
                'foreignField': 'ranch_name',
                'as': 'results'
            }
        }
    ]);

    const stockPrin = await Stock.aggregate([
        {
            '$match': {
                'ranch_owner': req.user.ranch
            }
        }
    ]);
    res.render('user/userhome', {
        doc_title: 'Usuario',
        usuarios,
        ranches,
        stockPrin
        //stockUser
    });
});


module.exports = router;