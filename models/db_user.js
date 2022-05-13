const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    planets: [mongoose.ObjectId]
})

module.exports = mongoose.model("User", userSchema);