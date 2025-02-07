const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
    pid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    count: { type: Number, required: true }
});

module.exports = mongoose.model('Person', personSchema);