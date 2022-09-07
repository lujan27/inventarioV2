const orderController = require('../../models/ordersModel');

function main (req, res) {
    let data = null;

    orderController.find({})
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
            catalogue: data,
        });
    });
}

module.exports = {
    main,
}