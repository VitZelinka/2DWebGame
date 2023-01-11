const func = require('../funcs.js');

let planet;
beforeEach(() => {
    planet = {resources: {metal: 0, crystals: 0},
            mines: {metal: 1, crystals: 0},
            jobQueue: [],
            resUpdate: 100*1000}
});

const SYSTEM_TIME = 150*1000;

jest.useFakeTimers();
jest.setSystemTime(SYSTEM_TIME);

function AddToQ(planet, type, info, finish) {
    planet.jobQueue.push({jobType: type, jobInfo: info, finishAt: finish});
}


test("only default resUpdate", () => {
    AddToQ(planet, "resUpdate", 0, 0);
    func.RefreshPlanet(planet);
    expect(planet.resUpdate).toEqual(SYSTEM_TIME);
    expect(planet.resources.metal).toEqual(50);
});

test("resUpdate | -> mineUpgrade(metal) -> resUpdate", () => {
    AddToQ(planet, "resUpdate", 160*1000, 0);
    AddToQ(planet, "mineUpgrade", "metal", 160*1000);
    AddToQ(planet, "resUpdate", 0, 160*1000);
    func.RefreshPlanet(planet);
    expect(planet.mines.metal).toEqual(1);
    expect(planet.resources.metal).toEqual(50*1);
});

test("resUpdate -> mineUpgrade(metal) | -> resUpdate", () => {
    AddToQ(planet, "resUpdate", 150*1000, 0);
    AddToQ(planet, "mineUpgrade", "metal", 150*1000);
    AddToQ(planet, "resUpdate", 0, 150*1000);
    func.RefreshPlanet(planet);
    expect(planet.mines.metal).toEqual(2);
    expect(planet.resources.metal).toEqual(50*1);
});

test("resUpdate -> mineUpgrade(metal) -> resUpdate |", () => {
    AddToQ(planet, "resUpdate", 120*1000, 0);
    AddToQ(planet, "mineUpgrade", "metal", 120*1000);
    AddToQ(planet, "resUpdate", 0, 120*1000);
    func.RefreshPlanet(planet);
    expect(planet.mines.metal).toEqual(2);
    expect(planet.resources.metal).toEqual(20*1 + 30*2);
});