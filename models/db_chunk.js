const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
    position: {x: Number, y: Number},
    planets: [mongoose.ObjectId]
});

module.exports = mongoose.model("Chunk", chunkSchema);