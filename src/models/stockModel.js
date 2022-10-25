const mongoose = require('mongoose');
const { Schema } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose); // <--------- Obligatorio

const StockSchema = new Schema(
    {
        _id: { type: Number },
        ranch_owner: {type: String, required: true},
        name: {type: String, required: true},
        description: {type: String},
        unit: {type: String, required: true},
        quantity: {type: Number, required: true}
    },
    {
        collection: 'stock',
        _id: false,         // <--------- Obligatorio
        versionKey: false   // <--------- Opcional
    }
);

StockSchema.index({ name: 'text' });
StockSchema.plugin(AutoIncrement, {id: 'id_Stock', inc_field: '_id'});

module.exports = mongoose.model('Stock', StockSchema);