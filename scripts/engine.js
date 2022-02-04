import {Planet} from "./modules.js";

export function GetNewCamPos(canvas, posRef){
    return {x: Math.floor(canvas.width/2)-posRef.x,
            y: Math.floor(canvas.height/2)-posRef.y};
}

export function VPToWorld(canvas, position, zoom, cameraPos){
    return {x: (position.x - Math.floor(canvas.width/2))/zoom + cameraPos.x,
            y: (position.y - Math.floor(canvas.height/2))/zoom + cameraPos.y};
}

export function WorldToCoor(position, gridSize){
    return {x: Math.floor(position.x/gridSize), y: Math.floor(position.y/gridSize)};
}

export function WorldToVP(canvas, position, zoom, cameraPos){
    return {x: ((position.x-cameraPos.x)*zoom)+Math.floor(canvas.width/2),
            y: ((position.y-cameraPos.y)*zoom)+Math.floor(canvas.height/2)};
} 

export function CoorToWorld(position, gridSize){
    return {x: position.x*gridSize, y: position.y*gridSize};
}

export function CoorToVP(canvas, position, zoom, cameraPos, gridSize){
    return WorldToVP(canvas, CoorToWorld(position, gridSize), 
                     zoom, cameraPos);
}

//Set camera position to coordinates
export function CamCoorToRef(canvas, position, gridSize){
    return {x: Math.floor(canvas.width/2) - (position.x*gridSize),
            y: Math.floor(canvas.height/2) - (position.y*gridSize)};
}

//TODO: fix gridSize, maybe refactor everything into class or do something i dont fucking know :D
export function FindClickedObjects(element){
    let planetWorldPos = element.GetWorldPos(gridSize);
    console.log(element);
    console.log("Debug:"+(planetWorldPos.x-25)+" "+this.x);
    if ((planetWorldPos.x-25) <= this.x && (planetWorldPos.x+25) >= this.x){
        if ((planetWorldPos.y-25) <= this.y && (planetWorldPos.y+25) >= this.y){
            return element;
        }
    }
    return element;
}
//xd classification