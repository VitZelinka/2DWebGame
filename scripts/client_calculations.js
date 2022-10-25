
function CalculateMetalMined(mineLvl, secDiff) {
    return mineLvl * secDiff;
}

function CalculateCrystalsMined(mineLvl, secDiff) {
    return mineLvl * secDiff;
}

export const ResFuncs = {metal: CalculateMetalMined,
                         crystals: CalculateCrystalsMined
                        };