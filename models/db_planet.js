const mongoose = require('mongoose');

const planetSchema = new mongoose.Schema({
    position: [Number],
})

module.exports = mongoose.model("Planet", planetSchema);