const resFuncs = require("./server_calculations.js");
const func = require("./funcs.js");

exports.TestFunc = function () {
    console.log("TEST FUNC :DDD");
}

exports.UpdatePlanetResDB = async function (planet) {
    const updateTime = Date.now();
    let secDiff = (updateTime - planet.resUpdate) / 1000;
    for (const [key, value] of Object.entries(planet.resources)) {
        planet.resources[key] = planet.resources[key] + resFuncs.mined[key](planet.mines[key], secDiff);
    }
    planet.resUpdate = updateTime;
    await planet.save();
}

exports.UpdatePlanetRes = function (planet) {
    const updateTime = Date.now();
    let secDiff = (updateTime - planet.resUpdate) / 1000;
    for (const [key, value] of Object.entries(planet.resources)) {
        planet.resources[key] = planet.resources[key] + resFuncs.mined[key](planet.mines[key], secDiff);
    }
    planet.resUpdate = updateTime;
}

exports.UpdatePlanetRes_CTime = function (planet, date) {
    const updateTime = date;
    let secDiff = (updateTime - planet.resUpdate) / 1000;
    for (const [key, value] of Object.entries(planet.resources)) {
        planet.resources[key] = planet.resources[key] + resFuncs.mined[key](planet.mines[key], secDiff);
    }
    planet.resUpdate = updateTime;
}


exports.RefreshPlanet = async function (planet) { // NOTE: might be a good idea to rewrite this with a linked list
    let newQueue = [];
    const currentTime = Date.now();
    const loop_n = planet.jobQueue.length;
    for (let i = 0; i < loop_n; i++) { // iterate thru every job
        let min = planet.jobQueue[0].finishAt;
        let minJob = planet.jobQueue[0];
        let jobIndex = 0;
        let tmpIndex = 0;
        for (const job of planet.jobQueue) { // find smallest (time) job, store in minJob
            if (job.finishAt < min) {min = job.finishAt; minJob = job; jobIndex = tmpIndex;}
            tmpIndex++;
        }
        switch (minJob.jobType) { // finishedAt = when to calculate the job
            case "resUpdate":
                const jobFinishAt = minJob.finishAt;
                if (jobFinishAt == 0) { // means do now
                    if (minJob.jobInfo == 0) { // means do until now
                        func.UpdatePlanetRes_CTime(planet, currentTime);
                        newQueue.push(minJob);
                    } else {
                        if (minJob.jobInfo > currentTime) {
                            func.UpdatePlanetRes_CTime(planet, currentTime);
                            newQueue.push(minJob);
                        } else {
                            func.UpdatePlanetRes_CTime(planet, minJob.jobInfo);
                            minJob.jobInfo = 0; // readds default job
                            newQueue.push(minJob);
                        }
                    }
                } else if (jobFinishAt > currentTime) {
                    newQueue.push(minJob); // just skips
                } else {
                    if (minJob.jobInfo == 0) {
                        func.UpdatePlanetRes_CTime(planet, currentTime);
                    } else if (minJob.jobInfo > currentTime) {
                        newQueue.push(minJob); // just skips
                    } else {
                        func.UpdatePlanetRes_CTime(planet, minJob.jobInfo);
                    }
                }
                planet.jobQueue.splice(jobIndex, 1);
                break;

            case "mineUpgrade":
                if (minJob.finishAt > currentTime) {
                    newQueue.push(minJob);
                    planet.jobQueue.splice(jobIndex, 1);
                } else {
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