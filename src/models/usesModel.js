const mongoose = require('mongoose');
const { Schema } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose); // <--------- Obligatorio

const usesSchema = new Schema(
    {
        _id: { type: Number },
        ranch_owner: {type: String, required: true},
        name: {type: String, required: true},
        description: {type: String, required: true},
        unit: {type: String, required: true},
        old_quantity: {type: Number, required: true},
        registered_qnty: {type: Number, required: true},
        new_quantity: {type: Number, required: true},
        user: {type: String, required: true},
        modify_date: {type: Date, default: Date.now()}
    },
    {
        collection: 'uses',
        _id: false,         // <--------- Obligatorio
        versionKey: false   // <--------- Opcional
    }
);

usesSchema.index({ name: 'text' });
usesSchema.plugin(AutoIncrement, {id: 'id_Uses', inc_field: '_id'});

module.exports = mongoose.model('Uses', usesSchema);