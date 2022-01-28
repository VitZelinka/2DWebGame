//CONFIG
const MAX_ZOOM = 1;
const MIN_ZOOM = 0.3;
const ZOOM_SPEED = 0.1;
const PLANET_SIZE = 50;
const GRID_SIZE_REF = 100;
//---------------------------------------


const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const image = document.getElementById('source');
let gridSize = 100;
let dragging = false;
let lastTouchPos = {x: 0, y: 0};
let mousePos = {x: 0, y: 0};
let desiredZoom = 0.8;
let zoomLevel = 0.8;
let cameraPos = {x: 0, y: 0};
let posRef = {x: 0, y: 0};
const coorText = document.getElementById("coordinates");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var socket = io();

socket.on("kokot", xd =>{
    console.log("message received :D", xd);
})


function UpdateCamPos(){
    const camMid = {x: Math.floor(canvas.width/2), y: Math.floor(canvas.height/2)};
    cameraPos = VPToWorld(camMid);
}

function GetMouseWorldPos(){
    return {x: mousePos.x-posRef.x, y: mousePos.y-posRef.y};
}

function VPToWorld(position){
    return {x: position.x-posRef.x, y: position.y-posRef.y};
}

function WorldToCoor(position){
    return {x: position.x/gridSize, y: position.y/gridSize};
}

function WorldToVP(position){
    return {x: ((position.x-cameraPos.x)*zoomLevel)+Math.floor(canvas.width/2),
            y: ((position.y-cameraPos.y)*zoomLevel)+Math.floor(canvas.height/2)};
}

function CoorToWorld(position){
    return {x: position.x*gridSize, y: position.y*gridSize};
}

//Set camera position to coordinates
function SetCamPos(position){
    posRef.x = Math.floor(canvas.width/2) - (position.x*gridSize);
    posRef.y = Math.floor(canvas.height/2) - (position.y*gridSize);
}











window.addEventListener("resize", xd => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})

function HandleDragStart(data){
    dragging = true;
    if (data.touches != null){
        lastTouchPos.x = data.touches[0].pageX;
        lastTouchPos.y = data.touches[0].pageY;
    }
}
canvas.addEventListener("mousedown", HandleDragStart, false);
canvas.addEventListener("touchstart", HandleDragStart, false);

function HandleDragMove(data){
    mousePos.x = data.pageX;
    mousePos.y = data.pageY;
    if (dragging){
        if (data.touches != null){
            posRef.y -= lastTouchPos.y - data.touches[0].pageY;
            posRef.x -= lastTouchPos.x - data.touches[0].pageX;
            lastTouchPos.x = data.touches[0].pageX;
            lastTouchPos.y = data.touches[0].pageY;
        } else {
            posRef.x += data.movementX/zoomLevel;
            posRef.y += data.movementY/zoomLevel;
        }
        UpdateCamPos();
    }
}
canvas.addEventListener("mousemove", HandleDragMove, false);
canvas.addEventListener("touchmove", HandleDragMove, false);

function HandleDragEnd(){
    dragging = false;
}
canvas.addEventListener("mouseup", HandleDragEnd, false);
canvas.addEventListener("touchend", HandleDragEnd, false);

canvas.addEventListener("wheel", data => {
    desiredZoom += data.deltaY * -0.001;
    if (desiredZoom < MIN_ZOOM){
        desiredZoom = MIN_ZOOM;
    } else if (desiredZoom > MAX_ZOOM){
        desiredZoom = MAX_ZOOM;
    }
})


function SmoothZoom(){
    let diff = Math.abs(zoomLevel - desiredZoom);
    let zoomAmount = diff * ZOOM_SPEED;
    if (zoomLevel == desiredZoom){return;}
    if (zoomLevel < desiredZoom){
        zoomLevel += zoomAmount;
    } else if (zoomLevel > desiredZoom){
        zoomLevel -= zoomAmount;
    }
}

class Planet{
    constructor(posX, posY){
        this.position = {x: posX, y: posY};
    }

    Draw(){
        let size = PLANET_SIZE * zoomLevel;
        //const drawPosX = (this.position.x * gridSize) - (size/2) + posRef.x;
        const drawPos = WorldToVP(CoorToWorld(this.position));
        ctx.drawImage(image, drawPos.x-(size/2), drawPos.y-(size/2), size, size);
        //ctx.drawImage(image, drawPosX, drawPosY, size, size);
    }

    GetWorldPos(){
        return CoorToWorld(this.position)
    }
}

function DrawLine(startX, startY, endX, endY, color, width){
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.closePath();
}

function DrawGrid(){
    const widthLines = Math.floor(((canvas.width/gridSize)+1)/zoomLevel);
    const heightLines = Math.floor(((canvas.height/gridSize)+1)/zoomLevel);
    const gridRef = {x: Math.floor((posRef.x/gridSize)), y: Math.floor((posRef.y/gridSize))};
    for (i = 0; i < widthLines; i++){
        const linePos = WorldToVP({x: (-i)*gridSize-posRef.x, y: 0});
        DrawLine(linePos.x, 0, linePos.x, canvas.height, "white", 0.1);
    }
    for (i = 0; i < heightLines; i++){
        const linePos = WorldToVP({x: 0, y: (-i-gridRef.y)*gridSize});
        DrawLine(0, linePos.y, canvas.width, linePos.y, "white", 0.1);
    }
}

let planet1 = new Planet(-5, -5);
let planet2 = new Planet(0, 0);
let planet3 = new Planet(15, 15);

function RenderFrame(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    SmoothZoom();
    DrawGrid();
    planet1.Draw();
    planet2.Draw();
    planet3.Draw();
    const camcoor = WorldToCoor(cameraPos);
    coorText.textContent = "X: " + camcoor.x + " Y: " + camcoor.y;
    //DrawLine(Math.floor(canvas.width/2), 0, Math.floor(canvas.width/2), canvas.height);
    //DrawLine(0, Math.floor(canvas.height/2), canvas.width, Math.floor(canvas.height/2));
    requestAnimationFrame(RenderFrame);
}

SetCamPos({x: 0, y: 0});
UpdateCamPos();
RenderFrame();