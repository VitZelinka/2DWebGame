
export default class Interactable {
    constructor(CPos, colliderType, size, zHeight){
        this.CPos = CPos;
        this.zHeight = zHeight;
        // colliderType 1 = circle, 2 = rectangle
        if (colliderType === "circle"){
            this.colliderType = 1;
        } else {
            this.colliderType = 2;
        }
        this.colliderSize = size;
    }

    GetWPos(engine){
        return engine.CoorToWorld(this.CPos);
    }

    CheckIfClicked(engine, clickWPos){
        const WPos = engine.CoorToWorld(this.CPos);
        // circle collider
        if (this.colliderType === 1){
            const dist = (WPos.x - clickWPos.x)**2 + (WPos.y - clickWPos.y)**2;
            if (dist < (this.colliderSize/2)**2){
                return true;
            }
            return false;
        // rectangle collider
        // TODO: make working rectangle collider with rotation
        } else if (this.colliderType === 2){
            const hitbox = {x: this.colliderSize.x/2, y: this.colliderSize.y/2};
            if ((WPos.x-hitbox.x) <= clickWPos.x && (WPos.x+hitbox.x) >= clickWPos.x){
                if ((WPos.y-hitbox.y) <= clickWPos.y && (WPos.y+hitbox.y) >= clickWPos.y){
                    return true;
                }
            }
            return false;
        }
        return false;
    }

    Click(engine){
        console.log(this.CPos);
    }
}