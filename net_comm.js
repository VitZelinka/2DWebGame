const db = require('./models/models.js');

module.exports = (io, socket) => {
    console.log('a user connected');
    socket.emit("kokot", "bruh");
    socket.on("get_planets", async () => {
        const data = await db.planet.find({});
        socket.emit("receive_planets", data);
    });
    socket.on("disconnect", () => {
        console.log("a user disconnected");
    })
}