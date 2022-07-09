const express = require('express');
const router = express.Router();

router.get('/user/', (req, res) => {
    res.render('user/userhome', {
        doc_title: 'Usuario',
    });
});


module.exports = router;