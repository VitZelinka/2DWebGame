import Planet from './planet.js';
import { UpdateCamPos, WorldToCoor, CoorToVP, VPToWorld, SetCamPos } from './UpdateCamPos';
//CONFIG
const MAX_ZOOM = 1;
const MIN_ZOOM = 0.3;
const ZOOM_SPEED = 0.1;
const GRID_SIZE_REF = 100;
//---------------------------------------


export const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const image = document.getElementById('source');
export let gridSize = 100;
let dragging = false;
let lastTouchPos = {x: 0, y: 0};
export let mousePos = {x: 0, y: 0};
let desiredZoom = 0.8;
export let zoomLevel = 0.8;
export let cameraPos = {x: 0, y: 0};
export let posRef = {x: 0, y: 0};
const coorText = document.getElementById("coordinates");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var socket = io();

socket.on("kokot", xd =>{
    console.log("message received :D", xd);
})


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

function DrawLine(startX, startY, endX, endY, color, width){
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.closePath();
}

function DrawGrid(color, thickness){
    const widthLines = Math.floor(((canvas.width/gridSize)/zoomLevel)/2)+2;
    const heightLines = Math.floor(((canvas.height/gridSize)/zoomLevel)/2)+2;
    const camCoor = WorldToCoor(cameraPos);
    for (let i = 0; i < widthLines; i++){
        let linePos = CoorToVP({x: i+camCoor.x, y: 0});
        if (i == 0){
            DrawLine(linePos.x, 0, linePos.x, canvas.height, color, thickness)
            continue;
        }
        DrawLine(linePos.x, 0, linePos.x, canvas.height, color, thickness);
        linePos = CoorToVP({x: -i+camCoor.x, y: 0});
        DrawLine(linePos.x, 0, linePos.x, canvas.height, color, thickness);
    }
    for (let i = 0; i < heightLines; i++){
        let linePos = CoorToVP({x: 0, y: i+camCoor.y});
        if (i == 0){
            DrawLine(0, linePos.y, canvas.width, linePos.y, color, thickness)
            continue;
        }
        DrawLine(0, linePos.y, canvas.width, linePos.y, color, thickness);
        linePos = CoorToVP({x: 0, y: -i+camCoor.y});
        DrawLine(0, linePos.y, canvas.width, linePos.y, color, thickness);
    }
}

let planet1 = new Planet(-5, -3);
let planet2 = new Planet(0, 0);
let planet3 = new Planet(15, 15);

function RenderFrame(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    SmoothZoom();
    DrawGrid("grey", 0.1);
    planet1.Draw();
    planet2.Draw();
    planet3.Draw();
    planet3.Entangle(planet1.GetCoor());
    const camcoor = VPToWorld(mousePos);
    coorText.textContent = "X: " + camcoor.x + " Y: " + camcoor.y;
    requestAnimationFrame(RenderFrame);
}

SetCamPos({x: 0, y: 0});
UpdateCamPos();
RenderFrame();