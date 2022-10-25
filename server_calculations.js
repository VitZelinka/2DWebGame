
function CalculateMetalMined(mineLvl, secDiff) {
    return mineLvl * secDiff;
}

function CalculateCrystalsMined(mineLvl, secDiff) {
    return mineLvl * secDiff;
}

const MineCalculationFunctions = {metal: CalculateMetalMined,
                                  crystals: CalculateCrystalsMined
                                 };
module.exports = MineCalculationFunctions;