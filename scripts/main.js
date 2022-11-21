import {Planet} from "./modules.js";
import {Engine} from "./modules.js";
import { PLANET_SIZE } from "./modules.js";

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const image = document.getElementById('source');
const coorText = document.getElementById("coordinates");

let socket = io();

export const engine = new Engine(canvas, ctx, socket);

canvas.width = Math.round(window.innerWidth*window.devicePixelRatio);
canvas.height = Math.round(window.innerHeight*window.devicePixelRatio);


socket.emit("c2s:get_planets");
socket.on("s2c:get_planets", data => {
    console.log(data);
    engine.objects.planets = [];
    engine.objects.ownedPlanets = [];
    data.ownedPlanets.forEach(element => {
        const planet = new Planet(element.position, "circle", PLANET_SIZE, 10, image,
                                  element.owner, element.entangled, element._id,
                                  element.resources, element.mines);
        engine.objects.ownedPlanets.push(planet);
    });
    data.otherPlanets.forEach(element => {
        const planet = new Planet(element.position, "circle", PLANET_SIZE, 10, image,
                                  element.owner, element.entangled, element._id);
        engine.objects.planets.push(planet);
    });
    console.log(engine.objects);
});

socket.on("s2c:debug_set_planet_data", (s = socket) => {
    s.emit("c2s:get_planets");
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
    const pos = {x: engine.mouseVPPos.x+100*engine.zoomLevel, y: engine.mouseVPPos.y+100*engine.zoomLevel};
    switch (key.code) {
        case "KeyA":
            socket.emit("c2s:new_planet", engine.VPToCoor(pos));
            break;
        case "KeyD":
            socket.emit("c2s:delete_planet", engine.VPToCoor(pos));
            break;
        case "KeyH":
            engine.MoveCam({x: 0, y: 0});
            break;
        case "KeyE":
            engine.DebugEntangle(engine.VPToCoor(pos));
            break;
        case "KeyR":
            engine.DebugUntangle(engine.VPToCoor(pos));
            break;
        case "KeyU":
            if (engine.uiOpen) {engine.CloseUI();}
            else {engine.LoadUI("planetdebugmenuui", engine.FindPlanetByCoor(engine.VPToCoor(pos)));}
            break;
        default:
            break;
    }
});


function RenderFrame(timestamp){
    engine.allObjects = [];
    for (const key in engine.objects) {
        engine.allObjects = engine.allObjects.concat(engine.objects[key]);
    }
    engine.frameTime = timestamp - engine.frameTime;
    engine.ctx.clearRect(0, 0, canvas.width, canvas.height);
    engine.SmoothZoom();
    engine.DrawGrid("grey", 0.1);
    engine.FrameEventExecute();
    engine.allObjects.forEach(element => {
        if (element.constructor.name === "Planet") {
            element.DrawEntangle(engine);
        }
    });
    engine.entangleDrawn = [];
    engine.allObjects.forEach(element => {
        if (element.constructor.name === "Planet") {
            element.Draw(engine);
        }
    });
    const camcoor = engine.VPToWorld(engine.mouseVPPos);
    //const camcoor = engine.mouseVPPos;
    //const camcoor = {x: screen.width, y: screen.height};
    //console.log(window.devicePixelRatio);
    //console.log(engine.frameTime);
    coorText.textContent = "X: " + camcoor.x + " Y: " + camcoor.y;
    // -------------------
    engine.frameTime = timestamp;
    requestAnimationFrame(RenderFrame);
}

setInterval(() => {
    engine.objects.ownedPlanets.forEach(element => {
        element.UpdateResources();
    });
    console.log(engine.TickEventSubsArray);
    engine.TickEventExecute();
    console.log("ticked");
}, 1000);
engine.MoveCam({x: 3, y: 0});
RenderFrame();