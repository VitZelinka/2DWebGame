import {Planet} from "./modules.js";
import {Engine} from "./modules.js";
import { PLANET_SIZE } from "./modules.js";

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const image = document.getElementById('source');
const coorText = document.getElementById("coordinates");

const engine = new Engine(canvas, ctx);

canvas.width = Math.round(window.innerWidth*window.devicePixelRatio);
canvas.height = Math.round(window.innerHeight*window.devicePixelRatio);

var socket = io();

socket.on("kokot", xd =>{
    console.log("message received :D", xd);
})

socket.emit("c2s:get_planets");

socket.on("s2c:receive_planets", data => {
    console.log(data);
    data.forEach(element => {
        const planet = new Planet(element.position, "circle", PLANET_SIZE, 10, image,
                                  element.owner, element.entangled, element._id);
        engine.objects.push(planet);
    });
    console.log("Loaded planet.");
});


window.addEventListener("resize", () => {
    canvas.width = Math.floor(window.innerWidth*window.devicePixelRatio);
    canvas.height = Math.floor(window.innerHeight*window.devicePixelRatio);
});

canvas.addEventListener("mousedown", () => {
    engine.dragging = true;
    engine.clicking = true;
});

canvas.addEventListener("mousemove", data => {
    engine.DragCamera(data);
    engine.clicking = false;
});

canvas.addEventListener("mouseup", () => {
    engine.dragging = false;
    if (engine.clicking){
        engine.clicking = false;
        engine.HandleClick(engine);
    }
});

canvas.addEventListener("wheel", data => {
    engine.ChangeZoom(data);
});

window.addEventListener("keypress", key => {
    switch (key.code) {
        case "KeyA":
            const pos = {x: engine.mouseVPPos.x+100, y: engine.mouseVPPos.y+100};
            socket.emit("c2s:new_planet", engine.VPToCoor(pos));
            break;
        default:
            break;
    }
});

console.log(engine.objects);
/*
let planet1 = new Planet({x: -5, y: -3}, "circle", PLANET_SIZE, 10, image);
let planet2 = new Planet({x: 0, y: 0},  "circle", PLANET_SIZE, 10, image);
let planet3 = new Planet({x: 15, y: 15},  "circle", PLANET_SIZE, 10, image);
engine.objects.push(planet1);
engine.objects.push(planet2);
engine.objects.push(planet3);
*/


function RenderFrame(timestamp){
    engine.frameTime = timestamp - engine.frameTime;
    engine.ctx.clearRect(0, 0, canvas.width, canvas.height);
    engine.SmoothZoom();
    engine.DrawGrid("grey", 0.1);
    engine.objects.forEach(element => {
        if (element.constructor.name === "Planet") {
            element.DrawEntangle(engine);
        }
    });
    engine.entangleDrawn = [];
    engine.objects.forEach(element => {element.Draw(engine)});
    const camcoor = engine.VPToWorld(engine.mouseVPPos);
    //const camcoor = engine.mouseVPPos;
    //const camcoor = {x: screen.width, y: screen.height};
    //console.log(window.devicePixelRatio);
    //console.log(engine.frameTime);
    coorText.textContent = "X: " + camcoor.x + " Y: " + camcoor.y;
    engine.frameTime = timestamp;
    requestAnimationFrame(RenderFrame);
}

engine.MoveCam({x: 3, y: 0});
RenderFrame();