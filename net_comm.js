const db = require('./models/models.js');
const mongoose = require('mongoose');
const func = require('./funcs.js');

module.exports = (io, socket) => {
    const req = socket.request;
    console.log('User ' + req.session.username + ' connected');


    socket.on("c2s:get_planets", async () => {
        let planets = {ownedPlanets: [], otherPlanets: []};
        planets.otherPlanets = await db.planet.find({owner: {$ne: req.session.userid}},
                    "position chunk owner entangled");
        planets.ownedPlanets = await db.planet.find({owner: req.session.userid});
        planets.ownedPlanets.forEach(element => {
            func.UpdatePlanetResDB(element);
        });
        socket.emit("s2c:get_planets", planets);
    });


    socket.on("c2s:new_planet", async (data) => {
        const planet = new db.planet({
            position: data,
            chunk: {x: Math.floor(data.x/25),
                    y: Math.floor(data.y/25)},
            owner: new mongoose.Types.ObjectId(req.session.userid),
            //entangled: [new mongoose.Types.ObjectId("6219f4770cadff24f2b13c33")]
            entangled: []
        });
        await planet.save();
        console.log("Planet added");
        // get planets
        let planets = {ownedPlanets: [], otherPlanets: []};
        planets.otherPlanets = await db.planet.find({owner: {$ne: req.session.userid}},
                    "position chunk owner entangled");
        planets.ownedPlanets = await db.planet.find({owner: req.session.userid});
        socket.emit("s2c:get_planets", planets);
    });


    socket.on("c2s:delete_planet", async (data) => {
        await db.planet.deleteOne({position: data});
        // get planets
        let planets = {ownedPlanets: [], otherPlanets: []};
        planets.otherPlanets = await db.planet.find({owner: {$ne: req.session.userid}},
                    "position chunk owner entangled");
        planets.ownedPlanets = await db.planet.find({owner: req.session.userid});
        socket.emit("s2c:get_planets", planets);
    });


    socket.on("disconnect", () => {console.log("a user disconnected");});
}