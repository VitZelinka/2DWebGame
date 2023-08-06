
import { default as Interactable } from "./interactable.js";
import { default as ResFuncs } from "./client_calculations.js";

export default class Planet extends Interactable {
    constructor(CPos, colliderType, size, zHeight, image, owner, entangled, id, resources, mines, jobQueue){
        super(CPos, colliderType, size, zHeight);
        this.owner = owner;
        this.entangled = entangled;
        this.id = id;
        this.image = image;
        this.resources = resources;
        this.mines = mines;
        this.resUpdated = Date.now();
        this.jobQueue = jobQueue;
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
            for (let j = 0; j < engine.allObjects.length; j++) {
                if (engine.allObjects[j].constructor.name === "Planet") {
                    if (engine.allObjects[j].id === this.entangled[i]) {
                        destCPos = engine.allObjects[j].CPos;
                    }
                }
            }
            if (destCPos === undefined) {return;}
            engine.DrawLineDynamic(engine.CoorToVP(this.CPos), engine.CoorToVP(destCPos), "yellow", 8);
        }
    }

    Click(engine) {
        console.log(this);
        engine.LoadUI("planetui", this);
    }

    UpdateResources() {
        const updateTime = Date.now();
        let secDiff = (updateTime - this.resUpdated) / 1000;
        for (const key in this.resources) {
            this.resources[key] = this.resources[key] + ResFuncs.mined[key](this.mines[key], secDiff);
        }
        this.resUpdated = updateTime;
    }
}
