import { PLANET_SIZE } from "./modules";
export default class Planet{
    constructor(position, image){
        this.position = {x: position.x, y: position.y};
        this.image = image;
    }

    Draw(zoom){
        let size = PLANET_SIZE * zoom;
        const drawPos = CoorToVP(this.position);
        ctx.drawImage(image, drawPos.x-(size/2), drawPos.y-(size/2), size, size);
    }

    GetWorldPos(){
        return CoorToWorld(this.position)
    }

    GetCoor(){
        return this.position;
    }

    Entangle(pos){
        const xd = CoorToVP(pos);
        const xd2 = CoorToVP(this.position);
        DrawLine(xd2.x, xd2.y, xd.x, xd.y, "yellow", 2);
    }
}
