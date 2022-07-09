const mongoose = require('mongoose');
const { Schema } = mongoose;

const RanchSchema = new Schema({
    ranch_name: {type: String, required: true},
    name_materiaPrima: {type: String, default: ""},
    description_materiaPrima: {type: String, default: ""},
    unidad_medida: {type: String, default: ""},
    quantity: {type: Number, default: 0},
    location: {type: String}
});

module.exports = mongoose.model('Ranch', RanchSchema);