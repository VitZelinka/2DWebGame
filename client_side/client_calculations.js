
function CalculateMetalMined(mineLvl, secDiff) {
    return mineLvl * secDiff;
}

function CalculateCrystalMined(mineLvl, secDiff) {
    return mineLvl * secDiff;
}

function CalculateMetalUpgradeCost(mineLvl) {
    return (mineLvl + 1) * 100;
}

function CalculateCrystalUpgradeCost(mineLvl) {
    return (mineLvl + 1) * 100;
}

const ResFuncs = {mined: {metal: CalculateMetalMined,
        crystal: CalculateCrystalMined},
        cost: {metal: CalculateMetalUpgradeCost,
        crystal: CalculateCrystalUpgradeCost}
};

export default ResFuncs;