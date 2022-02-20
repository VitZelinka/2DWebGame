
import {Interactable} from "./modules.js";
import { PLANET_SIZE } from "./modules.js";

export default class Planet extends Interactable {
    constructor(CPos, colliderType, size, zHeight, image){
        super(CPos, colliderType, size, zHeight);
        this.image = image;
    }

    Draw(engine){
        const size = this.colliderSize * engine.zoomLevel;
        const drawPos = engine.CoorToVP(this.CPos);
        engine.ctx.drawImage(this.image, drawPos.x-(size/2), drawPos.y-(size/2), size, size);
    }

}
