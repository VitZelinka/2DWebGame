const mongoose = require('mongoose');

const planetSchema = new mongoose.Schema({
    position: {x: Number, y: Number},
    chunk: {x: Number, y: Number},
    owner: mongoose.ObjectId,
    entangled: [mongoose.ObjectId],
    resources: {metal: {type: Number, default: 0}},
    mines: {metal: {type: Number, default: 0}},
    construction: {building: {type: String, default: ""}, doneAt: Date},
    resUpdate: {type: Date, default: Date.now}
})

module.exports = mongoose.model("Planet", planetSchema);