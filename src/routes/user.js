const express = require('express');
const router = express.Router();
const user = require('../models/users/userModel');
const ranch = require('../models/ranchModel');
const stock = require('../models/stockModel');
const { isAuthUser } = require('../config/sessionUser');

router.get('/user', isAuthUser, async (req, res) => {
    const ranches = await ranch.aggregate([
        {
            '$match': {
                ranch_name: {$ne: 'Rancho Principal'}
            }
        }
    ]);
    const usuarios = await user.aggregate([
        {
            '$lookup': {
                'from': 'ranches',
                'localField': 'ranch',
                'foreignField': 'ranch_name',
                'as': 'results'
            }
        }
    ]);

    const stockPrin = await stock.aggregate([
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