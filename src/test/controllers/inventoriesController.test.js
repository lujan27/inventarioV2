const inventories = require('../models/inventoriesModel.test');

async function main(params) {
    new inventories.Inventory_1({
        test: 'true_1'
    }).save();

    new inventories.Inventory_2().save();

    new inventories.Inventory_3({
        test: 'true_3'
    }).save();

    new inventories.Inventory_4({
        test: 'hola!!!!'
    }).save();

    return false;
}

module.exports = {
    main,
}