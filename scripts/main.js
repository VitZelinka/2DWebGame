import { MAX_ZOOM, MIN_ZOOM, ZOOM_SPEED, GRID_SIZE_REF } from "./config.js";
import {Planet} from "./modules.js";
import {GetNewCamPos, VPToWorld, WorldToCoor, WorldToVP,
        CoorToWorld, CoorToVP, CamCoorToRef} from "./modules.js";

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const image = document.getElementById('source');
let gridSize = GRID_SIZE_REF;
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
        cameraPos = GetNewCamPos(canvas, posRef);
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
    const camCoor = WorldToCoor(cameraPos, gridSize);
    for (let i = 0; i < widthLines; i++){
        let linePos = CoorToVP(canvas,{x: i+camCoor.x, y: 0},zoomLevel,cameraPos,gridSize);
        if (i == 0){
            DrawLine(linePos.x, 0, linePos.x, canvas.height, color, thickness)
            continue;
        }
        DrawLine(linePos.x, 0, linePos.x, canvas.height, color, thickness);
        linePos = CoorToVP(canvas,{x: -i+camCoor.x, y: 0},zoomLevel, cameraPos, gridSize);
        DrawLine(linePos.x, 0, linePos.x, canvas.height, color, thickness);
    }
    for (let i = 0; i < heightLines; i++){
        let linePos = CoorToVP(canvas,{x: 0, y: i+camCoor.y},zoomLevel,cameraPos,gridSize);
        if (i == 0){
            DrawLine(0, linePos.y, canvas.width, linePos.y, color, thickness)
            continue;
        }
        DrawLine(0, linePos.y, canvas.width, linePos.y, color, thickness);
        linePos = CoorToVP(canvas,{x: 0, y: -i+camCoor.y},zoomLevel,cameraPos,gridSize);
        DrawLine(0, linePos.y, canvas.width, linePos.y, color, thickness);
    }
}

let planet1 = new Planet({x: -5, y: -3}, image);
let planet2 = new Planet({x: 0, y: 0}, image);
let planet3 = new Planet({x: 15, y: 15}, image);

function RenderFrame(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    SmoothZoom();
    DrawGrid("grey", 0.1);
    planet1.Draw(ctx, canvas, zoomLevel, cameraPos, gridSize);
    planet2.Draw(ctx, canvas, zoomLevel, cameraPos, gridSize);
    planet3.Draw(ctx, canvas, zoomLevel, cameraPos, gridSize);
    const camcoor = VPToWorld(canvas, mousePos, zoomLevel, cameraPos);
    coorText.textContent = "X: " + camcoor.x + " Y: " + camcoor.y;
    requestAnimationFrame(RenderFrame);
}

posRef = CamCoorToRef(canvas, {x: 0, y: 0}, gridSize);
cameraPos = GetNewCamPos(canvas, posRef);
RenderFrame();