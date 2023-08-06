import {default as Planet} from "./planet.js";
import {default as Engine} from "./engine.js";
import { PLANET_SIZE } from "./config.js";
import {default as RegSocketOns} from "./netcode.js";
export {default as ResFuncs} from "./client_calculations.js";
export * as RandFuncs from "./funcs.js";
const _ = require("lodash");

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const image = document.getElementById('source');
const coorText = document.getElementById("coordinates");

const socket = io();

export const engine = new Engine(canvas, ctx, socket);

canvas.width = Math.round(window.innerWidth*window.devicePixelRatio);
canvas.height = Math.round(window.innerHeight*window.devicePixelRatio);

//const pingTestStart = Date.now();
socket.emit("c2s:get_time", (response) => {
    //const latency = Date.now() - pingTestStart;
    //engine.timeOffset = response - Date.now() + latency;
    engine.timeOffset = response - Date.now();
});

RegSocketOns();

socket.emit("c2s:get_planets");
socket.on("s2c:get_planets", data => {
    console.log(data);
    engine.objects.planets = [];
    engine.objects.ownedPlanets = [];
    data.ownedPlanets.forEach(element => {
        const planet = new Planet(element.position, "circle", PLANET_SIZE, 10, image,
                                  element.owner, element.entangled, element._id,
                                  element.resources, element.mines, element.jobQueue);
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
            socket.emit("c2s:delete_planet", engine.GetPlanetByCoor(engine.VPToCoor(pos)));
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
            else {engine.LoadUI("planetdebugmenuui", engine.GetPlanetByCoor(engine.VPToCoor(pos)));}
            break;
        case "KeyP":
            socket.emit("debug:get_job", "637e31aaab84fa789e443004", (response) => {
                console.log(response);
            });
            break;
        default:
            break;
    }
});


function RenderFrame(timestamp){
    engine.allObjects = [];
    engine.CalculateChunks();
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
    const mousewp = engine.VPToWorld(engine.mouseVPPos);
    const camcoor = engine.WorldToCoor(engine.camWPos);
    engine.DebugDrawLoadedChunks();
    //const camcoor = engine.mouseVPPos;
    //const camcoor = {x: screen.width, y: screen.height};
    //console.log(window.devicePixelRatio);
    //console.log(engine.frameTime);
    coorText.textContent = "Cursor World Position - X: " + Math.round(mousewp.x) + " Y: " + Math.round(mousewp.y);
    coorText.textContent += "\nFPS: " + (1000/engine.frameTime).toFixed(2);
    coorText.textContent += "\nChunk coordinates - X: " + Math.floor(camcoor.x/25) + " Y: " + Math.floor(camcoor.y/25);
    let chunkString = "";
    engine.chunks.forEach(element => {
        chunkString += "|x:" + element.x + "y:" + element.y + "| ";
    });
    coorText.textContent += "\nLoaded chunks: " + chunkString;
    coorText.textContent += "\nZoom: " + engine.zoomLevel;
    // -------------------
    engine.frameTime = timestamp;
    requestAnimationFrame(RenderFrame);
}

setInterval(() => {
    engine.objects.ownedPlanets.forEach(element => {
        element.UpdateResources();
    });
    socket.emit("c2s:test");
    engine.TickEventExecute();
}, 1000);
engine.MoveCam({x: 3, y: 0});
RenderFrame();