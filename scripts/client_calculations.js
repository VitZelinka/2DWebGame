
function CalculateMetalMined(mineLvl, secDiff) {
    return mineLvl * secDiff;
}

function CalculateCrystalMined(mineLvl, secDiff) {
    return mineLvl * secDiff;
}

export const ResFuncs = {metal: CalculateMetalMined,
                         crystal: CalculateCrystalMined
                        };