import { ZOOM_SPEED, MIN_ZOOM, MAX_ZOOM, GRID_SIZE_REF } from "./config.js";
const _ = require("lodash");

export default class Engine {
    constructor(canvas, ctx, socket){
        this.canvas = canvas;
        this.ctx = ctx;
        this.socket = socket;
        this.gridSize = GRID_SIZE_REF;
        this.dragging = false;
        this.clicking = false;
        this.lastTouchVPPos = {x: 0, y: 0};
        this.mouseVPPos = {x: 0, y: 0};
        this.desiredZoom = 1;
        this.zoomLevel = 0.3;
        this.camWPos = {x: 0, y: 0};
        this.posVPRef = {x: 0, y: 0};
        this.objects = {planets: [], ownedPlanets: []};
        this.allObjects = [];
        this.chunks = [];
        this.frameTime = 1;
        this.entangleDrawn = [];
        this.timeOffset;
        this.time = () => {return Date.now() + this.timeOffset;}
        // UI
        this.uiOpen = false;
        this.uiData;
        this.uiOnQuit = [];
        // EVENTS
        this.TickEventSubsArray = [];
        this.FrameEventSubsArray = [];
        // DEBUG VARS
        this.debugEntangleSelected = null;
        this.debugUntangleSelected = null;
    }
    
    //---------- COORDINATES ----------

    VPToWorld(VPPos){
        const pixRatio = window.devicePixelRatio;
        return {x: (VPPos.x*pixRatio - Math.floor(this.canvas.width/2))/this.zoomLevel + this.camWPos.x,
                y: (VPPos.y*pixRatio - Math.floor(this.canvas.height/2))/this.zoomLevel + this.camWPos.y};
    }

    VPToCoor(VPPos){
        return this.WorldToCoor(this.VPToWorld(VPPos));
    }
    
    WorldToCoor(WPos){
        return {x: Math.floor(WPos.x/this.gridSize), y: Math.floor(WPos.y/this.gridSize)};
    }
    
    WorldToVP(WPos){
        return {x: ((WPos.x-this.camWPos.x)*this.zoomLevel)+Math.floor(this.canvas.width/2),
                y: ((WPos.y-this.camWPos.y)*this.zoomLevel)+Math.floor(this.canvas.height/2)};
    } 
    
    CoorToWorld(CPos){
        return {x: CPos.x*this.gridSize, y: CPos.y*this.gridSize};
    }
    
    CoorToVP(CPos){
        return this.WorldToVP(this.CoorToWorld(CPos));
    }

    //---------- CAMERA ----------

    UpdateCamWPos(){
        this.camWPos = {x: Math.floor(this.canvas.width/2)-this.posVPRef.x,
                        y: Math.floor(this.canvas.height/2)-this.posVPRef.y};
    }

    MoveCam(CPos){
        this.posVPRef = {x: Math.floor(this.canvas.width/2) - (CPos.x*this.gridSize),
                         y: Math.floor(this.canvas.height/2) - (CPos.y*this.gridSize)};
        this.UpdateCamWPos();
    }

    SmoothZoom(){
        const diff = Math.abs(this.zoomLevel - this.desiredZoom);
        let speedModifier;
        if (Number.isNaN(this.frameTime)){
            speedModifier = 1;
        } else {
            speedModifier = this.frameTime;
        }
        const zoomAmount = diff * ZOOM_SPEED * speedModifier;
        if (this.zoomLevel === this.desiredZoom){return;}
        if (this.zoomLevel < this.desiredZoom){
            this.zoomLevel += zoomAmount;
        } else if (this.zoomLevel > this.desiredZoom){
            this.zoomLevel -= zoomAmount;
        }
    }

    DragCamera(data){
        this.mouseVPPos.x = data.pageX;
        this.mouseVPPos.y = data.pageY;
        if (this.dragging){
            this.posVPRef.x += (data.movementX/this.zoomLevel);
            this.posVPRef.y += (data.movementY/this.zoomLevel);
            this.UpdateCamWPos();
        }
    }

    ChangeZoom(data){
        this.desiredZoom += data.deltaY * -0.001 * this.zoomLevel;
        if (this.desiredZoom < MIN_ZOOM){
            this.desiredZoom = MIN_ZOOM;
        } else if (this.desiredZoom > MAX_ZOOM){
            this.desiredZoom = MAX_ZOOM;
        }
    }
    
    //---------- CHUNKS ----------

    CalculateChunks() {
        const beforeUpdate = _.cloneDeep(this.chunks);
        const camcoor = this.WorldToCoor(this.camWPos);
        const middleChunk = {x: Math.floor(camcoor.x/25), y: Math.floor(camcoor.y/25)};
        if (this.zoomLevel > 0.38) {
            if ((middleChunk.y - Math.round(camcoor.y/25)) == 0) {
                this.chunks = [{x:middleChunk.x-1, y:middleChunk.y-1}, {x:middleChunk.x, y:middleChunk.y-1}, {x:middleChunk.x+1, y:middleChunk.y-1},
                               {x:middleChunk.x-1, y:middleChunk.y}, middleChunk, {x:middleChunk.x+1, y:middleChunk.y}];
            } else {
                this.chunks = [{x:middleChunk.x-1, y:middleChunk.y}, middleChunk, {x:middleChunk.x+1, y:middleChunk.y},
                               {x:middleChunk.x-1, y:middleChunk.y+1}, {x:middleChunk.x, y:middleChunk.y+1}, {x:middleChunk.x+1, y:middleChunk.y+1}];
            }
        } else {
            this.chunks = [{x:middleChunk.x-1, y:middleChunk.y-1}, {x:middleChunk.x, y:middleChunk.y-1}, {x:middleChunk.x+1, y:middleChunk.y-1},
                           {x:middleChunk.x-1, y:middleChunk.y}, middleChunk, {x:middleChunk.x+1, y:middleChunk.y},
                           {x:middleChunk.x-1, y:middleChunk.y+1}, {x:middleChunk.x, y:middleChunk.y+1}, {x:middleChunk.x+1, y:middleChunk.y+1}];
        }
        
        const oldChunks = _.differenceWith(beforeUpdate, this.chunks, _.isEqual);
        const newChunks = _.differenceWith(this.chunks, beforeUpdate, _.isEqual);
        if (oldChunks.length > 0 || newChunks.length > 0) {
            this.socket.emit("c2s:load_new_chunks", {old: oldChunks, new: newChunks});
        }
    }




    //---------- RENDERING ----------

    DrawLine(startVPPos, endVPPos, color, width){
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.moveTo(startVPPos.x, startVPPos.y);
        this.ctx.lineTo(endVPPos.x, endVPPos.y);
        this.ctx.stroke();
        this.ctx.closePath();
    }

    DrawLineDynamic(startVPPos, endVPPos, color, width){
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width*this.zoomLevel;
        this.ctx.moveTo(startVPPos.x, startVPPos.y);
        this.ctx.lineTo(endVPPos.x, endVPPos.y);
        this.ctx.stroke();
        this.ctx.closePath();
    }

    DrawGrid(color, thickness){
        const widthLines = Math.floor(((this.canvas.width/this.gridSize)/this.zoomLevel)/2)+2;
        const heightLines = Math.floor(((this.canvas.height/this.gridSize)/this.zoomLevel)/2)+2;
        const camCoor = this.WorldToCoor(this.camWPos);
        for (let i = 0; i < widthLines; i++){
            let linePos = this.CoorToVP({x: i+camCoor.x, y: 0});
            if (i == 0){
                this.DrawLine({x:linePos.x,y:0},{x:linePos.x,y:this.canvas.height},color,thickness);
                continue;
            }
            this.DrawLine({x:linePos.x,y:0},{x:linePos.x,y:this.canvas.height},color,thickness);
            linePos = this.CoorToVP({x: -i+camCoor.x, y: 0});
            this.DrawLine({x:linePos.x,y:0},{x:linePos.x,y:this.canvas.height},color,thickness);
        }
        for (let i = 0; i < heightLines; i++){
            let linePos = this.CoorToVP({x: 0, y: i+camCoor.y});
            if (i == 0){
                this.DrawLine({x:0,y:linePos.y},{x:this.canvas.width,y:linePos.y},color,thickness);
                continue;
            }
            this.DrawLine({x:0,y:linePos.y},{x:this.canvas.width,y:linePos.y},color,thickness);
            linePos = this.CoorToVP({x: 0, y: -i+camCoor.y});
            this.DrawLine({x:0,y:linePos.y},{x:this.canvas.width,y:linePos.y},color,thickness);
        }
    }


    //---------- INPUT ----------

    HandleClick(engine){
        let clickedObjects = this.allObjects.map(this.FindClickedObjects, engine);
        clickedObjects = clickedObjects.filter(obj => obj != null);
        clickedObjects.forEach(object => {
            object.Click(this);
        })
    }

    FindClickedObjects(object){
        const mouseWPos = this.VPToWorld(this.mouseVPPos);
        if (object.CheckIfClicked(this, mouseWPos)){
            return object;
        }
        return null;
    }

    //---------- UI ----------

    LoadUI(UIname, data) {
        this.CloseUI()
        this.uiData = data;
        let filename = UIname + ".html";
        let UIelement = document.getElementById("ui");
        let fragment;
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    fragment = document.createRange().createContextualFragment(this.responseText);
                    UIelement.appendChild(fragment.cloneNode(true));
                }
            }
        }
        xhttp.open("GET", "ui/"+filename, true);
        xhttp.send();
        this.uiOpen = true;
    }

    CloseUI() {
        for (let index = 0; index < this.uiOnQuit.length; index++) {
            this.uiOnQuit[index]();
        }
        this.uiOnQuit = [];
        this.uiOpen = false;
        let UIelement = document.getElementById("ui");
        UIelement.innerHTML = "";
    }

    //---------- BACKEND ----------

    // TICK EVENT SUBSCRIBING
    TickEventExecute() {
        for (let i = 0; i < this.TickEventSubsArray.length; i++) {
            this.TickEventSubsArray[i].func();
        }
    }

    TickEventSubscribe(func, funcId) {
        this.TickEventSubsArray.push({func: func, funcId: funcId});
    }

    TickEventUnsubscribe(funcId) {
        let index = this.TickEventSubsArray.findIndex((element) => {
            return element.funcId === funcId;
        });
        if (index > -1) {
            this.TickEventSubsArray.splice(index, 1);
        }
    }

    TickEventUiOnQuitUnsubscribe(funcId) {
        this.uiOnQuit.push((e = this) => {e.TickEventUnsubscribe(funcId)});
    }

    //-------------------------
    // FRAME EVENT SUBSCRIBING
    FrameEventExecute() {
        for (let i = 0; i < this.FrameEventSubsArray.length; i++) {
            this.FrameEventSubsArray[i].func();
        }
    }

    FrameEventSubscribe(func, funcId) {
        this.FrameEventSubsArray.push({func: func, funcId: funcId});
    }

    FrameEventUnsubscribe(funcId) {
        let index = this.FrameEventSubsArray.findIndex((element) => {
            return element.funcId === funcId;
        });
        if (index > -1) {
            this.FrameEventSubsArray.splice(index, 1);
        }
    }
    // ------------------------

    //---------- HELPER FUNCTIONS ----------

    GetPlanetByCoor(coor) {
        let foundElem = null;
        this.allObjects.forEach(element => {
            if (element.constructor.name === "Planet") {
                if (JSON.stringify(element.CPos) === JSON.stringify(coor)) {
                    foundElem = element;
                }
            }
        });
        return foundElem;
    }

    GetPlanetById_Unowned(id) {
        return this.objects.planets.filter((element) => {
            return element.id === id;
        });
    }

    GetPlanetById_Owned(id) {
        return this.objects.ownedPlanets.filter((element) => {
            return element.id === id;
        });
    }

    
    //---------- DEBUG ----------
    
    DebugEntangleDrawLine(a, b, c , d, e) {
        e.DrawLine(a, b ,c , d);
    }

    DebugEntangle(planetCoor) {
        let planet = this.GetPlanetByCoor(planetCoor);
        if (this.debugEntangleSelected == null) {
            if (planet !== null) {
                this.FrameEventSubscribe((engine = this) => {
                    engine.DebugEntangleDrawLine(this.CoorToVP(planetCoor), this.mouseVPPos, "red", 5, this)
                }, "debugEntangleDrawLine");
                this.debugEntangleSelected = planet;
            }
        } else {
            if (planet !== null) {
                let toEntangle = {first: this.debugEntangleSelected.id, second: planet.id};
                this.socket.emit("c2s:debug_entangle_planets", toEntangle);
                this.debugEntangleSelected.entangled.push(planet.id);
                planet.entangled.push(this.debugEntangleSelected.id);
            }
            this.FrameEventUnsubscribe("debugEntangleDrawLine");
            this.debugEntangleSelected = null;
        }
    }

    DebugUntangle(planetCoor) {
        let planet = this.GetPlanetByCoor(planetCoor);
        if (this.debugUntangleSelected == null) {
            if (planet !== null) {
                this.FrameEventSubscribe((engine = this) => {
                    engine.DebugEntangleDrawLine(this.CoorToVP(planetCoor), this.mouseVPPos, "red", 5, this)
                }, "debugUntangleDrawLine");
                this.debugUntangleSelected = planet;
            }
        } else {
            if (planet !== null) {
                let toUntangle = {first: this.debugUntangleSelected.id, second: planet.id};
                this.socket.emit("c2s:debug_untangle_planets", toUntangle);
                let index = this.debugUntangleSelected.entangled.findIndex((element) => {
                    return element === planet.id;
                });
                this.debugUntangleSelected.entangled.splice(index, 1);
                index = planet.entangled.findIndex((element) => {
                    return element === this.debugUntangleSelected.id;
                });
                planet.entangled.splice(index, 1);
            }
            this.FrameEventUnsubscribe("debugUntangleDrawLine");
            this.debugUntangleSelected = null;
        }
    }

    DebugSetPlanetData(data) {
        console.log("DEBUGIGKGJGNG");
        this.socket.emit("c2s:debug_set_planet_data", data);
    }

    DebugDrawChunk(chunkpos) {
        this.DrawLine(this.WorldToVP({x:chunkpos.x*5000, y:chunkpos.y*5000}), this.WorldToVP({x:(chunkpos.x+1)*5000, y:chunkpos.y*5000}), "pink", 5);
        this.DrawLine(this.WorldToVP({x:chunkpos.x*5000, y:chunkpos.y*5000}), this.WorldToVP({x:chunkpos.x*5000, y:(chunkpos.y+1)*5000}), "pink", 5);
        this.DrawLine(this.WorldToVP({x:(chunkpos.x+1)*5000, y:chunkpos.y*5000}), this.WorldToVP({x:(chunkpos.x+1)*5000, y:(chunkpos.y+1)*5000}), "pink", 5);
        this.DrawLine(this.WorldToVP({x:chunkpos.x*5000, y:(chunkpos.y+1)*5000}), this.WorldToVP({x:(chunkpos.x+1)*5000, y:(chunkpos.y+1)*5000}), "pink", 5);
    }

    DebugDrawLoadedChunks() {
        this.chunks.forEach(element => {
            this.DebugDrawChunk(element);
        });
    }

}
