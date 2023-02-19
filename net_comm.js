const db = require('./models/models.js');
const mongoose = require('mongoose');
const func = require('./funcs.js');
const resFuncs = require("./server_calculations.js");

module.exports = (io, socket) => {
    const req = socket.request;
    console.log('User: '+req.session.username+' with ID: '+req.session.userid+' connected.');


    socket.on("c2s:get_planets", async () => {
        let planets = {ownedPlanets: [], otherPlanets: []};
        planets.otherPlanets = await db.planet.find({owner: {$ne: req.session.userid}},
                    "position chunk owner entangled");
        planets.ownedPlanets = await db.planet.find({owner: req.session.userid});
        planets.ownedPlanets.forEach(async (element) => {
            func.RefreshPlanet(element);
            await element.save();
        });
        socket.emit("s2c:get_planets", planets);
        console.log("sent planets");
    });


    socket.on("c2s:new_planet", async (data) => {
        const planet = new db.planet({
            position: data,
            chunk: {x: Math.floor(data.x/25),
                    y: Math.floor(data.y/25)},
            owner: new mongoose.Types.ObjectId(req.session.userid),
            entangled: [],
            jobQueue: [{jobType: "resUpdate", jobInfo: 0, finishAt: 0}]
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

    // ------------- BUILDING UPGRADING ----------------

    socket.on("c2s:upgrade_mine", async (data, callback) => {
        const toUpgrade = data.toUpgrade;
        let planet = await db.planet.findById(data.planetId);
        func.RefreshPlanet(planet);
        const cost = resFuncs.cost[toUpgrade](planet.mines[toUpgrade]);
        if (cost > planet.resources[toUpgrade]) {
            callback(false);
        } else {
            console.log("Successful request to upgrade a mine")
            func.AddJobToQ(planet, {jobType: "mineUpgrade", jobInfo: toUpgrade, finishAt: Date.now()+10000});
            planet.resources[toUpgrade] -= cost;
            await planet.save();
            callback(true);
        }
    });

    // --------------- SYNC ----------------------
    socket.on("c2s:get_time", (callback) => {
        callback(Date.now());
    });

    // ----------- DEBUG ------------------------

    socket.on("c2s:example", (data, callback) => {
        console.log("Example Call: " + data);
        callback("Received call");
    });

    socket.on("c2s:debug_entangle_planets", async (data) => {
        let planet = await db.planet.findById(data.first);
        planet.entangled.push(data.second);
        await planet.save();

        planet = await db.planet.findById(data.second);
        planet.entangled.push(data.first);
        await planet.save();
        console.log("Succesfully entangled two planets.");
    });

    socket.on("c2s:debug_untangle_planets", async (data) => {
        let planet = await db.planet.findById(data.first);
        let index = planet.entangled.indexOf(data.second);
        planet.entangled.splice(index, 1);
        await planet.save();

        planet = await db.planet.findById(data.second);
        index = planet.entangled.indexOf(data.first);
        planet.entangled.splice(index, 1);
        await planet.save();
    });

    socket.on("c2s:debug_set_planet_data", async (data) => {
        let planet = await db.planet.findById(data.planetId);
        planet.resUpdate = Date.now();
        if (data.resMetal !== "") {
            planet.resources.metal = Number(data.resMetal);
        }
        if (data.resCrystal !== "") {
            planet.resources.crystal = Number(data.resCrystal);
        }
        if (data.mineMetal !== "") {
            planet.mines.metal = Number(data.mineMetal);
        }
        if (data.mineCrystal !== "") {
            planet.mines.crystal = Number(data.mineCrystal);
        }
        await planet.save();
        socket.emit("s2c:debug_set_planet_data");
        console.log("Set new planet data.");
    });

    socket.on("debug:get_job", async (data, callback) => {
        let planet = await db.planet.findById(data);
        func.RefreshPlanet(planet);
        await planet.save();
        callback(planet.jobQueue);
    });

    socket.on("disconnect", () => {console.log("a user disconnected");});
}