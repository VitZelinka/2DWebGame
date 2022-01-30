

function UpdateCamPos(){
    cameraPos = {x: Math.floor(canvas.width/2)-posRef.x,
                 y: Math.floor(canvas.height/2)-posRef.y};
}

// deprecated
function VPToWorld2(position){
    return {x: position.x-posRef.x, y: position.y-posRef.y};
}

function VPToWorld(){
    return {x: (mousePos.x - Math.floor(canvas.width/2))/zoomLevel + cameraPos.x,
            y: (mousePos.y - Math.floor(canvas.height/2))/zoomLevel + cameraPos.y};
}

function WorldToCoor(position){
    return {x: Math.floor(position.x/gridSize), y: Math.floor(position.y/gridSize)};
}

function WorldToVP(position){
    return {x: ((position.x-cameraPos.x)*zoomLevel)+Math.floor(canvas.width/2),
            y: ((position.y-cameraPos.y)*zoomLevel)+Math.floor(canvas.height/2)};
} 
/*
    (x-y)*z+n = f;
    (x-y)*z = f-n;
    x-y = (f-n)/z;
    x = (f-n)/z + y;
    y - cameraPos
    z - zoomLevel
    n - screenMidPoint
    f - VPpos
    x - World pos
*/

function CoorToWorld(position){
    return {x: position.x*gridSize, y: position.y*gridSize};
}

function CoorToVP(position){
    return WorldToVP(CoorToWorld(position));
}

//Set camera position to coordinates
function SetCamPos(position){
    posRef.x = Math.floor(canvas.width/2) - (position.x*gridSize);
    posRef.y = Math.floor(canvas.height/2) - (position.y*gridSize);
}