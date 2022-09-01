const mongoose = require('mongoose');
const { Schema } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const catalogueSchema = new Schema({
    _id: {type: Number},
    nameProduct: {type: String, required: true, unique: true},
    descriptionProduct: {type: String, required: true}
},{
    _id: false,
    versionKey: false
});

catalogueSchema.plugin(AutoIncrement, {id: 'id_MainCat', inc_field: '_id'});

module.exports = mongoose.model('MainCatalogue', catalogueSchema);