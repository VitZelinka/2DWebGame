
import { PLANET_SIZE } from "./modules.js";
import { CoorToVP, CoorToWorld } from "./modules.js";

export default class Planet{
    constructor(position, image){
        this.position = {x: position.x, y: position.y};
        this.image = image;
    }

    Draw(ctx, canvas, zoom, cameraPos, gridSize){
        let size = PLANET_SIZE * zoom;
        const drawPos = CoorToVP(canvas,this.position,zoom,cameraPos,gridSize);
        ctx.drawImage(this.image, drawPos.x-(size/2), drawPos.y-(size/2), size, size);
    }

    GetWorldPos(){
        return CoorToWorld(this.position)
    }

    GetCoor(){
        return this.position;
    }
}
