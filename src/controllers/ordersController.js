const orderController = require('../models/ordersModel');
const stockModel = require('../models/stockModel');

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

function getStockItem(req, res) {
    var item, status;

    stockModel.findOne(req.params)
    .then(data => {
        item = data;
        status = 200;
    })
    .catch(error => {
        item = false;
        status = 404;
    })
    .finally(() => {
        return res.status(status).send(JSON.stringify({
            item
        }))
    })
}

module.exports = {
    main,
    getStockItem,
}