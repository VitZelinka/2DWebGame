const mongoose = require('mongoose');

const planetSchema = new mongoose.Schema({
    position: {x: Number, y: Number},
    chunk: {x: Number, y: Number},
    owner: mongoose.ObjectId
})

module.exports = mongoose.model("Planet", planetSchema);