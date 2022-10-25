const ResFuncs = require("./server_calculations.js");

exports.TestFunc = function () {
    console.log("TEST FUNC :DDD");
}

exports.UpdatePlanetResDB = async function (planet) {
    const updateTime = Date.now();
    let secDiff = (updateTime - planet.resUpdate.getTime()) / 1000;
    for (const [key, value] of Object.entries(planet.resources)) {
        planet.resources[key] = planet.resources[key] + ResFuncs[key](planet.mines[key], secDiff);
    }
    planet.resUpdate = updateTime;
    await planet.save();
}