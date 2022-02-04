
import { PLANET_SIZE } from "./modules.js";
import {Engine} from "./modules.js";

export default class Planet{
    constructor(CPos, image){
        this.CPos = {x: CPos.x, y: CPos.y};
        this.image = image;
    }

    Draw(engine){
        let size = PLANET_SIZE * engine.zoomLevel;
        const drawPos = engine.CoorToVP(this.CPos);
        engine.ctx.drawImage(this.image, drawPos.x-(size/2), drawPos.y-(size/2), size, size);
    }

    GetWPos(engine){
        return engine.CoorToWorld(this.CPos);
    }

    GetHitbox(engine){
        return PLANET_SIZE/2;
    }

    GotClicked(){
        console.log(this.CPos);
    }
}
