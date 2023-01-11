const mongoose = require('mongoose');

const planetSchema = new mongoose.Schema({
    position: {x: Number, y: Number},
    chunk: {x: Number, y: Number},
    owner: mongoose.ObjectId,
    entangled: [mongoose.ObjectId],
    resources: {metal: {type: Number, default: 0},
                crystals: {type: Number, default: 0}},
    mines: {metal: {type: Number, default: 0},
            crystals: {type: Number, default: 0}},
    jobQueue: [{jobType: {type: String}, 
                jobInfo: {type: Object}, 
                finishAt: {type: Number}}],
    resUpdate: {type: Date, default: Date.now}
})

module.exports = mongoose.model("Planet", planetSchema);