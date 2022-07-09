const mongoose = require('mongoose')

// Esquema para inventarios
const inventorySchema = new mongoose.Schema({
    _id: { type: Number },
    name: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true },
    display: { type: Boolean, required: true, default: true },
})

module.exports = mongoose.model('main_inventory', inventorySchema)