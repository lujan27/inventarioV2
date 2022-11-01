const mongoose = require('mongoose');
const { Schema } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose); // <--------- Obligatorio

const OrderSchema = new Schema(
    {
        _id: { type: Number},      // <--------- Obligatorio
        pdOrd: {type: String},
        qntyOrd: {type: Number},
        noteOrd: {type: String},
        unit: {type: String},
        description: {type: String},
        status: {type: String},
        order_date: { type: Date, default: Date.now() },
        module: {type: String},
        userOrder: {type: String},
        userRanch: {type: String},
        reasonsCoord: {type: String},
        reasonsAdmin: {type: String},
        statusCoord: {type: String},
        statusAdmin: {type: String}
        
    },
    {
        _id: false,         // <--------- Obligatorio
        versionKey: false   // <--------- Opcional
    }
);

OrderSchema.plugin(AutoIncrement, {id: 'id_Order', inc_field: '_id'}); // <--------- Obligatorio

module.exports = mongoose.model('Orders', OrderSchema);
