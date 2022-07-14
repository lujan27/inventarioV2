const mongoose = require('mongoose');
const { Schema } = mongoose;

const InvSchema = new Schema({
    test: {type: String, default: 'Hola!'},
});

module.exports = {
    'Inventory_1': mongoose.model('Inv_1', InvSchema),
    'Inventory_2': mongoose.model('Inv_2', InvSchema),
    'Inventory_3': mongoose.model('Inv_3', InvSchema),
    'Inventory_4': mongoose.model('Inv_4', InvSchema),
}