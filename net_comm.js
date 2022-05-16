const db = require('./models/models.js');
const mongoose = require('mongoose');

module.exports = (io, socket) => {
    const req = socket.request;
    console.log('User ' + req.session.username + ' connected');
    socket.emit("kokot", "bruh");
    socket.on("c2s:get_planets", async () => {
        const data = await db.planet.find({});
        socket.emit("s2c:receive_planets", data);
    });

    socket.on("c2s:new_planet", async (data) => {
        const planet = new db.planet({
            position: data,
            chunk: {x: Math.floor(data.x/25),
                    y: Math.floor(data.y/25)},
            owner: new mongoose.Types.ObjectId(req.session.userid),
            entangled: [new mongoose.Types.ObjectId("6219f4770cadff24f2b13c33")]
        });
        await planet.save();
        console.log("Planet added");
        const p_data = await db.planet.find({});
        socket.emit("s2c:receive_planets", p_data);
    });

    socket.on("disconnect", () => {console.log("a user disconnected");});
}