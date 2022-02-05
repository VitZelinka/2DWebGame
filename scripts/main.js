import {Planet} from "./modules.js";
import {Engine} from "./modules.js";

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const image = document.getElementById('source');
const coorText = document.getElementById("coordinates");

const engine = new Engine(canvas, ctx);

canvas.width = window.innerWidth*window.devicePixelRatio;
canvas.height = window.innerHeight*window.devicePixelRatio;

var socket = io();

socket.on("kokot", xd =>{
    console.log("message received :D", xd);
})


window.addEventListener("resize", xd => {
    canvas.width = window.innerWidth*window.devicePixelRatio;
    canvas.height = window.innerHeight*window.devicePixelRatio;
})

canvas.addEventListener("mousedown", data => {
    engine.dragging = true;
    engine.clicking = true;
});

canvas.addEventListener("mousemove", data => {
    engine.DragCamera(data);
    engine.clicking = false;
});

canvas.addEventListener("mouseup", data => {
    engine.dragging = false;
    if (engine.clicking){
        engine.clicking = false;
        engine.HandleClick(engine);
    }
});

canvas.addEventListener("wheel", data => {
    engine.ChangeZoom(data);
});

let planet1 = new Planet({x: -5, y: -3}, image);
let planet2 = new Planet({x: 0, y: 0}, image);
let planet3 = new Planet({x: 15, y: 15}, image);
engine.objects.push(planet1);
engine.objects.push(planet2);
engine.objects.push(planet3);



function RenderFrame(){
    engine.ctx.clearRect(0, 0, canvas.width, canvas.height);
    engine.SmoothZoom();
    engine.DrawGrid("grey", 0.1);
    planet1.Draw(engine);
    planet2.Draw(engine);
    planet3.Draw(engine);
    //const camcoor = engine.VPToWorld(engine.mouseVPPos);
    const camcoor = {x: screen.width*window.devicePixelRatio, y: screen.height*window.devicePixelRatio};
    console.log(window.devicePixelRatio);
    coorText.textContent = "X: " + camcoor.x + " Y: " + camcoor.y;
    requestAnimationFrame(RenderFrame);
}

engine.MoveCam({x: 0.5, y: 0});
engine.UpdateCamWPos();
RenderFrame();