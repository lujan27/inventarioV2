const mongoose = require('mongoose');
const { Schema } = mongoose;

const StockSchema = new Schema({
    ranch_owner: {type: String, required: true},
    name_materiaPrima: {type: String, required: true},
    description_materiaPrima: {type: String, required: true},
    unidad_medida: {type: String, required: true},
    quantity: {type: Number, required: true}
});

StockSchema.index({ name_materiaPrima: 'text' });

module.exports = mongoose.model('Stock', StockSchema);