const mongoose = require('mongoose');
const { Schema } = mongoose;

const RanchSchema = new Schema({
    ranch_name: {type: String, required: true},
    location: {type: String}
});

module.exports = mongoose.model('Ranch', RanchSchema);