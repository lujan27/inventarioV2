const orderController = require('../../models/ordersModel');
const stockModel = require('../../models/stockModel');

function main (req, res) {
    let data = null;

    stockModel.find({})
    .then((result) => {
        data = result;
    })
    .catch(error => {
        console.error(error);
        data = false;
    })
    .finally(() => {
        return res.render('coordinator/catalogue', {
            doc_title: 'Coordinador - Ordenes',
            data: data,
        });
    });
}

module.exports = {
    main,
}