const mongoose = require('mongoose');
const { Schema } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose); // <--------- Obligatorio

const RanchSchema = new Schema(
    {
        _id: { type: Number },      // <--------- Obligatorio
        items: { type: Array, required: true },
        order_date: { type: Date, default: Date.now() },
        status: { type: String, trim: true, default: 'Pedido prueba' }
    },
    {
        _id: false,         // <--------- Obligatorio
        versionKey: false   // <--------- Opcional
    }
);

RanchSchema.plugin(AutoIncrement); // <--------- Obligatorio

module.exports = mongoose.model('Orders', RanchSchema);
