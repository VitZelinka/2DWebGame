const resFuncs = require("./server_calculations.js");
const func = require("./funcs.js");
const LinkedList = require("dbly-linked-list");

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

exports.RefreshPlanet = async function (planet) {
    let newQueue = [];
    const currentTime = Date.now();
    const loop_n = planet.jobQueue.length;

    for (let i = 0; i < loop_n; i++) { // iterate thru every job
        let job = planet.jobQueue[i];

        switch (job.jobType) { // finishedAt = when to calculate the job
            case "resUpdate":
                if (job.finishAt > job.jobInfo && job.jobInfo !== 0){break;}
                
                if (job.finishAt == 0) { // means do now
                    if (job.jobInfo == 0) { // means do until now
                        func.UpdatePlanetRes_CTime(planet, currentTime);
                        newQueue.push(job);
                    } else {
                        if (job.jobInfo > currentTime) {
                            func.UpdatePlanetRes_CTime(planet, currentTime);
                            newQueue.push(job);
                        } else {
                            func.UpdatePlanetRes_CTime(planet, job.jobInfo);
                            job.jobInfo = 0; // readds default job
                            newQueue.push(job);
                        }
                    }
                } else if (job.finishAt > currentTime) {
                    newQueue.push(job); // just skips
                } else {
                    if (job.jobInfo == 0) {
                        func.UpdatePlanetRes_CTime(planet, currentTime);
                    } else if (job.jobInfo > currentTime) {
                        newQueue.push(job); // just skips
                    } else {
                        func.UpdatePlanetRes_CTime(planet, job.jobInfo);
                    }
                }
                break;

            case "mineUpgrade":
                if (job.finishAt > currentTime) {
                    newQueue.push(job);
                } else {
                    planet.mines[job.jobInfo]++;
                }
                break;

            default:
                break;
        }
    }

    planet.jobQueue = newQueue;
    await planet.save();
}


exports.AddJobToQ = function (planet, job) {
    let q_dll = new LinkedList();
    planet.jobQueue.forEach(element => {
        q_dll.insert(element);
    });

    switch(job.jobType) {
        case "mineUpgrade":
            let resUpdateJob = {jobType: "resUpdate", jobInfo: 0, finishAt: job.finishAt + 1};
            let biggerNode = q_dll.getHeadNode();
            let wasNull = false;
            while (biggerNode.getData().finishAt <= job.finishAt) {
                biggerNode = biggerNode.next;
                if (biggerNode == null) {
                    biggerNode = q_dll.getTailNode();
                    wasNull = true;
                    break;
                }
            }
            let tmpNode = biggerNode;
            while (tmpNode !== null) { // look backwards
                if (tmpNode.getData().jobType === "resUpdate") {
                    let tmpObj = tmpNode.getData();
                    tmpObj.jobInfo = job.finishAt;
                    tmpNode.data = tmpObj;
                    break;
                }
                tmpNode = tmpNode.prev;
            }

            tmpNode = biggerNode;
            while (tmpNode !== null) { // look forward
                if (tmpNode.getData().jobType === "mineUpgrade") {
                    resUpdateJob.jobInfo = tmpNode.getData().finishAt;
                    break;
                }
                tmpNode = tmpNode.next;
            }

            if (!wasNull) {
                q_dll.insertBefore(biggerNode.getData(), job);
                q_dll.insertBefore(biggerNode.getData(), resUpdateJob);
            } else {
                q_dll.insertAfter(biggerNode.getData(), resUpdateJob);
                q_dll.insertAfter(biggerNode.getData(), job);
            }
            break;
            
        default:
            break;
    }
    planet.jobQueue = q_dll.toArray();
}
