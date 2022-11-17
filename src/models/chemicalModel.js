const mongoose = require('mongoose');
const { Schema } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const chemiSchema = new Schema(
    {
        _id: {type: Number},
        chemical_name: {type: String},
        // owner: {type: String},
        lote: {type: String},
        quantity: {type: String},
        category: {type: String},
        created: {type: Date},
        caducity: {type: Date}
    },
    {
        _id: false,
        versionKey: false
    }
)

chemiSchema.plugin(AutoIncrement, {id: 'id_chemical', inc_field: '_id'});

module.exports = mongoose.model('Chemical', chemiSchema);