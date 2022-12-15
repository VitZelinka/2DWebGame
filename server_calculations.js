
function CalculateMetalMined(mineLvl, secDiff) {
    return mineLvl * secDiff;
}

function CalculateCrystalsMined(mineLvl, secDiff) {
    return mineLvl * secDiff;
}

function CalculateMetalUpgradeCost(mineLvl) {
    return (mineLvl + 1) * 100;
}

function CalculateCrystalUpgradeCost(mineLvl) {
    return (mineLvl + 1) * 100;
}

const MineCalculationFunctions = {mined: {metal: CalculateMetalMined,
                                    crystals: CalculateCrystalsMined},
                                  cost: {metal: CalculateMetalUpgradeCost,
                                    crystals: CalculateCrystalUpgradeCost}
                                 };
module.exports = MineCalculationFunctions;
