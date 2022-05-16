
import {Interactable} from "./modules.js";
import { PLANET_SIZE } from "./modules.js";

export default class Planet extends Interactable {
    constructor(CPos, colliderType, size, zHeight, image, owner, entangled, id){
        super(CPos, colliderType, size, zHeight);
        this.owner = owner;
        this.entangled = entangled;
        this.id = id;
        this.image = image;
    }

    Draw(engine) {
        const size = this.colliderSize * engine.zoomLevel;
        const drawPos = engine.CoorToVP(this.CPos);
        engine.ctx.drawImage(this.image, drawPos.x-(size/2), drawPos.y-(size/2), size, size);
    }

    DrawEntangle(engine) {
        for (let i = 0; i < this.entangled.length; i++) {
            let skip = false;
            for (let j = 0; j < engine.entangleDrawn.length; j++) {
                if (engine.entangleDrawn[j].from === this.entangled[i] && engine.entangleDrawn[j].to === this.id) {
                    skip = true;
                    break;
                }
            }
            if (skip) {continue;}
            engine.entangleDrawn.push({from: this.id, to: this.entangled[i]});
            let destCPos;
            for (let j = 0; j < engine.objects.length; j++) {
                if (engine.objects[j].id === this.entangled[i]) {
                    destCPos = engine.objects[j].CPos;
                }
            }
            engine.DrawLineDynamic(engine.CoorToVP(this.CPos), engine.CoorToVP(destCPos), "yellow", 8);
        }
    }

}
