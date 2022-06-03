import { ZOOM_SPEED, MIN_ZOOM, MAX_ZOOM, GRID_SIZE_REF } from "./config.js";

export default class Engine{
    constructor(canvas, ctx){
        this.canvas = canvas;
        this.ctx = ctx;
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
        this.frameTime = 1;
        this.entangleDrawn = [];
        this.TickSecond = false;
    }
    
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
        this.desiredZoom += data.deltaY * -0.001;
        if (this.desiredZoom < MIN_ZOOM){
            this.desiredZoom = MIN_ZOOM;
        } else if (this.desiredZoom > MAX_ZOOM){
            this.desiredZoom = MAX_ZOOM;
        }
    }
    
    //---------- DRAWING ----------

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
            object.Click();
        })
    }

    FindClickedObjects(object){
        const mouseWPos = this.VPToWorld(this.mouseVPPos);
        if (object.CheckIfClicked(this, mouseWPos)){
            return object;
        }
        return null;
    }
}
