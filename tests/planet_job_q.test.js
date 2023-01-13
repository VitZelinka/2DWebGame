const func = require('../funcs.js');

let planet;
beforeEach(() => {
    planet = {resources: {metal: 0, crystal: 0},
            mines: {metal: 1, crystal: 0},
            jobQueue: [],
            resUpdate: 100*1000}
});

const SYSTEM_TIME = 150*1000;

jest.useFakeTimers();
jest.setSystemTime(SYSTEM_TIME);

function AddToQ(planet, type, info, finish) {
    planet.jobQueue.push({jobType: type, jobInfo: info, finishAt: finish});
}

console.log("DON'T FORGET TO COMMENT OUT DB CALL AT THE END OF THE FUNCTION !!!");

test("only default resUpdate", () => {
    AddToQ(planet, "resUpdate", 0, 0);
    func.RefreshPlanet(planet);
    expect(planet.jobQueue[0].finishAt).toEqual(0);
    expect(planet.jobQueue[0].jobInfo).toEqual(0);
    expect(planet.resUpdate).toEqual(SYSTEM_TIME);
    expect(planet.resources.metal).toEqual(50);
});

test("resUpdate | -> mineUpgrade(metal) -> resUpdate", () => {
    AddToQ(planet, "resUpdate", 160*1000, 0);
    AddToQ(planet, "mineUpgrade", "metal", 160*1000);
    AddToQ(planet, "resUpdate", 0, 160*1000+1);
    func.RefreshPlanet(planet);
    expect(planet.jobQueue[0].finishAt).toEqual(0);
    expect(planet.mines.metal).toEqual(1);
    expect(planet.resources.metal).toEqual(50*1);
});

test("resUpdate -> mineUpgrade(metal) | -> resUpdate", () => {
    AddToQ(planet, "resUpdate", 150*1000, 0);
    AddToQ(planet, "mineUpgrade", "metal", 150*1000);
    AddToQ(planet, "resUpdate", 0, 150*1000+1);
    func.RefreshPlanet(planet);
    expect(planet.jobQueue[0].finishAt).toEqual(0);
    expect(planet.jobQueue[0].jobInfo).toEqual(0);
    expect(planet.mines.metal).toEqual(2);
    expect(planet.resources.metal).toEqual(50*1);
});

test("resUpdate -> mineUpgrade(metal) -> resUpdate |", () => {
    AddToQ(planet, "resUpdate", 120*1000, 0);
    AddToQ(planet, "mineUpgrade", "metal", 120*1000);
    AddToQ(planet, "resUpdate", 0, 120*1000+1);
    func.RefreshPlanet(planet);
    expect(planet.jobQueue[0].finishAt).toEqual(0);
    expect(planet.jobQueue[0].jobInfo).toEqual(0);
    expect(planet.mines.metal).toEqual(2);
    expect(planet.resources.metal).toEqual(20*1 + 30*2);
});

test("resUpdate -> mineUpgrade(metal,2.) -> resUpdate -> mineUpgrade(crystal,1.) -> resUpdate |", () => {
    AddToQ(planet, "resUpdate", 110*1000, 0);
    AddToQ(planet, "mineUpgrade", "metal", 130*1000);
    AddToQ(planet, "resUpdate", 130*1000, 110*1000+1);
    AddToQ(planet, "mineUpgrade", "crystal", 110*1000);
    AddToQ(planet, "resUpdate", 0, 130*1000+1);
    func.RefreshPlanet(planet);
    expect(planet.jobQueue[0].finishAt).toEqual(0);
    expect(planet.jobQueue[0].jobInfo).toEqual(0);
    expect(planet.mines.metal).toEqual(2);
    expect(planet.mines.crystal).toEqual(1);
    expect(planet.resources.metal).toEqual(30*1 + 20*2);
    expect(planet.resources.crystal).toEqual(40);
});