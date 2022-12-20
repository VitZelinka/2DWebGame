const resFuncs = require("./server_calculations.js");
const func = require("./funcs.js");

exports.TestFunc = function () {
    console.log("TEST FUNC :DDD");
}

exports.UpdatePlanetResDB = async function (planet) {
    const updateTime = Date.now();
    let secDiff = (updateTime - planet.resUpdate.getTime()) / 1000;
    for (const [key, value] of Object.entries(planet.resources)) {
        planet.resources[key] = planet.resources[key] + resFuncs.mined[key](planet.mines[key], secDiff);
    }
    planet.resUpdate = updateTime;
    await planet.save();
}

exports.UpdatePlanetRes = function (planet) {
    const updateTime = Date.now();
    let secDiff = (updateTime - planet.resUpdate.getTime()) / 1000;
    for (const [key, value] of Object.entries(planet.resources)) {
        planet.resources[key] = planet.resources[key] + resFuncs.mined[key](planet.mines[key], secDiff);
    }
    planet.resUpdate = updateTime;
}

UpdatePlanetRes_CTime = function (planet, date) {
    const updateTime = date;
    let secDiff = (updateTime - planet.resUpdate.getTime()) / 1000;
    for (const [key, value] of Object.entries(planet.resources)) {
        planet.resources[key] = planet.resources[key] + resFuncs.mined[key](planet.mines[key], secDiff);
    }
    planet.resUpdate = updateTime;
}

exports.RefreshPlanet = async function (planet) {
    console.log("Refreshing planet");
    let newQueue = [];
    const currentTime = Date.now();
    const loop_n = planet.jobQueue.length;
    for (let i = 0; i < loop_n; i++) {
        console.log("I ran the loop");
        let min = planet.jobQueue[0].finishAt;
        let minJob = planet.jobQueue[0];
        let jobIndex = 0;
        for (const job of planet.jobQueue) {
            if (job.finishAt < min) {min = job.finishAt; minJob = job; jobIndex++;}
        }
        switch (minJob.jobType) { // finishedAt = when to calculate the job
            case "resUpdate":
                if (minJob.finishAt.getTime() == 0) { // means do now
                    if (minJob.jobInfo == 0) { // means do until now
                        func.UpdatePlanetRes(planet); // TODO: this is wrong, idk brui fix it:D
                    } else {
                        if (minJob.jobInfo > currentTime) {
                            func.UpdatePlanetRes(planet);
                        } else {
                            func.UpdatePlanetRes_CTime(planet, minJob.jobInfo);
                        }
                    }
                    console.log("Pushed to new: ", minJob.jobType);
                    newQueue.push(minJob);
                } else {
                    func.UpdatePlanetRes_CTime(planet, minJob.finishAt); // TODO: readd resUpdate to index 0 
                }
                console.log("Spliced: ", planet.jobQueue[jobIndex].jobType);
                planet.jobQueue.splice(jobIndex, 1);
                break;

            case "mineUpgrade":
                console.log("Upgrading mine");
                if (minJob.finishAt > currentTime) {
                    console.log("Not yet");
                    newQueue.push(minJob);
                    planet.jobQueue.splice(jobIndex, 1);
                } else {
                    console.log("Upgraded", jobIndex);
                    planet.mines[minJob.jobInfo]++;
                    planet.jobQueue.splice(jobIndex, 1);
                }
                break;

            default:
                break;
        }
    }
    planet.jobQueue = newQueue;
    await planet.save();
}