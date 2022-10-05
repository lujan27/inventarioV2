const mongoose = require('mongoose');
const { Schema } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose); // <--------- Obligatorio

const OrderSchema = new Schema(
    {
        _id: { type: Number},      // <--------- Obligatorio
        items: { type: Array, required: true },
        order_date: { type: Date, default: Date.now() },
        module: {type: String},
        userOrder: {type: String},
        userRanch: {type: String},
        
    },
    {
        _id: false,         // <--------- Obligatorio
        versionKey: false   // <--------- Opcional
    }
);

OrderSchema.plugin(AutoIncrement, {id: 'id_Order', inc_field: '_id'}); // <--------- Obligatorio

module.exports = mongoose.model('Orders', OrderSchema);
