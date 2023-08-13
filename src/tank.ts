import p5 from "p5";
import { getConfig } from "./config";
import { worldPositionToScreenPosition } from "./coordsUtils";
import { fireDustParticle } from "./dust";
import { spawnExplosion } from "./explosions";
import { TeamColour, dropFlagIfPlayerCarrying } from "./flags";
import { calcGroundAngle, calcGroundHeightAt } from "./ground";
import {
    getImageFor,
    getRandomTankImgIxForTeam,
    getTankImg,
    getTankImgOrFail,
    storeTankImageFor,
} from "./images";
import { Projectile } from "./projectile";
import { getSocket } from "./socketio";
import { getPlayer } from "./player";
import { getCachedTankById } from "./tanksCache";
export type TankId = number;

export interface ReceivedTank {
    pos: p5.Vector;
    id: TankId;
    teamColour: TeamColour;
}

export class Tank {
    id: TankId;
    pos: p5.Vector;
    vel: p5.Vector;
    isFacingRight: boolean;
    imgIx: number;
    aiming: boolean;
    aimPower: number;
    barrelAngle: number;
    bodyAngle: number;
    health: number;
    damageDisplay: number;
    hitRadius: number;
    isDead: boolean;
    teamColour: TeamColour;
    lastHeardFromAtMs: number;

    constructor(
        x: number,
        y: number,
        id: number,
        teamColour: TeamColour,
        p: p5
    ) {
        this.id = id;
        this.pos = p.createVector(x, y);
        this.vel = p.createVector(0, 1);
        this.isFacingRight = true;
        this.imgIx = getRandomTankImgIxForTeam(teamColour, p);
        this.aiming = false;
        this.aimPower = 50;
        this.barrelAngle = 0;
        this.bodyAngle = 0;
        this.health = 3;
        this.damageDisplay = 0; //for how much longer to be displaying damage (flash white)
        this.hitRadius = 40; //how close a projectile has to be to hit this tank.
        this.isDead = false;
        this.teamColour = teamColour;
        this.lastHeardFromAtMs = p.millis();
    }

    updateFromReceivedTank(receivedTank: ReceivedTank, p: p5) {
        //copy all properties from received tank
        Object.assign(this, receivedTank);
        //overwrite this attrib
        this.lastHeardFromAtMs = p.millis();
    }

    takeDamage(projectile: Projectile, p: p5) {
        this.damageDisplay = 10;
        //todo: drop flag in all cases
        if (this.id === getPlayer().id) {
            dropFlagIfPlayerCarrying();
        }
        this.health--;
        if (this.health <= 0) {
            this.isDead = true;
            for (let i = 0; i < 10; i++) {
                const pos = p5.Vector.random2D().mult(30).add(projectile.pos);
                setTimeout(
                    () => spawnExplosion(pos, p.createVector(0, 0), "tank", p),
                    i * 100
                );
            }
        }
    }

    draw(p: p5) {
        p.push();
        const screenPos = worldPositionToScreenPosition(this.pos, p);
        p.translate(screenPos.x, screenPos.y);
        p.rotate(this.bodyAngle);
        if (!this.isFacingRight) {
            p.scale(-1, 1); //possible scale to flip horizontally
        }

        const img = getTankImgOrFail(this.teamColour, this.imgIx + "");
        const imgWhite = makeAndCacheWhiteImageIfNecessary(
            this.teamColour,
            this.imgIx + "",
            p
        );
        const imgToDraw = this.damageDisplay > 0 ? imgWhite : img;

        // _drawTurret(this, this.barrelAngle)
        if (this.isDead) {
            p.tint(255, 70);
        }
        p.imageMode(p.CENTER);
        p.image(imgToDraw, 0, 0);
        drawAimingArrow(this, this.barrelAngle, p);

        p.pop();

        this.drawText(p);
        this.drawShields(p);

        // this.drawHitRadius();
    }

    //this doesn't get called when we draw the tank - it has to go behind ground - be drawn before it
    drawExplosionCircle(p: p5) {
        p.push();
        //draw explosion circle and colour the ground correctly
        p.stroke(255, 10);
        p.fill("rgba(255,165,0,0.69)");
        const cPos = worldPositionToScreenPosition(getPlayer().pos, p);
        p.circle(cPos.x, cPos.y, p.random(150, 200));
        p.fill(40);
        p.circle(cPos.x, cPos.y, 100);
        p.pop();
    }

    drawHitRadius(p: p5) {
        p.push();
        p.translate(worldPositionToScreenPosition(this.pos, p));
        p.noFill();
        p.stroke(255, 100);
        p.circle(0, 0, this.hitRadius * 2);
        p.pop();
    }

    drawText(p: p5) {
        p.push();
        p.translate(worldPositionToScreenPosition(this.pos, p));
        p.textSize(20);
        p.fill("white");
        p.textAlign(p.CENTER, p.CENTER);
        p.text(this.id % 10000, 0, 100);
        p.pop();
    }
    drawShields(p: p5) {
        for (let i = 0; i < this.health; i++) {
            p.push();
            p.translate(worldPositionToScreenPosition(this.pos, p));
            p.translate(-50 + i * 50, 130);
            p.scale(0.08);
            p.imageMode(p.CENTER);
            p.image(getImageFor("shield"), 0, 0);
            p.pop();
        }
    }

    update(p: p5) {
        this.pos.add(this.vel);

        this.damageDisplay = p.max(0, this.damageDisplay - 1);

        if (p.frameCount % 6 === 0 && getConfig().shouldTransmit) {
            getSocket().emit("tankUpdate", this);
        }
        const playerAccel =
            p.keyIsDown(p.RIGHT_ARROW) || p.keyIsDown(68)
                ? 0.15
                : p.keyIsDown(p.LEFT_ARROW) || p.keyIsDown(65)
                ? -0.15
                : 0;

        const localGroundHeight = calcGroundHeightAt(this.pos.x, p);
        if (this.pos.y > localGroundHeight - 20) {
            this.pos.y = localGroundHeight - 20;
            this.maybeThrowUpDust(playerAccel, p);
        }

        this.bodyAngle = calcGroundAngle(this.pos.x, 40, p);
        const player = getPlayer();
        if (p.abs(playerAccel) > 0) {
            player.vel.x += playerAccel;
        } else {
            player.vel.x *= 0.95;
            player.vel.y = 3;
        }

        //set facing based on vel
        if (this.vel.x > 0) {
            this.isFacingRight = true;
        } else if (this.vel.x < 0) {
            this.isFacingRight = false;
        } else {
            //else, don't change facing
        }

        this.aimBarrel(p);
    }

    maybeThrowUpDust(playerAccel: number, p: p5) {
        if (p.abs(this.vel.x) > 0.2) {
            if (p.abs(playerAccel) > 0) {
                const srcPos = p.createVector(
                    this.pos.x - Math.sign(this.vel.x) * 20,
                    this.pos.y + 20
                );
                const throwAngle = this.isFacingRight
                    ? this.bodyAngle - p.PI + p.radians(20)
                    : -p.radians(20) + this.bodyAngle;
                fireDustParticle(srcPos, this.vel.x, throwAngle, p);
            }
        }
    }

    calcFiringAngle(p: p5) {
        const barAng = this.barrelAngle;
        const bodyAng = this.bodyAngle;
        return this.isFacingRight ? barAng + bodyAng : -p.PI + bodyAng - barAng;
    }

    aimBarrel(p: p5) {
        const player = getPlayer();
        if (p.keyIsDown(87)) {
            //"w"
            if (player.barrelAngle > -p.PI - 0.5) {
                player.barrelAngle -= 0.02;
            }
        } else if (p.keyIsDown(83)) {
            //"s"
            if (player.barrelAngle < 0.5) {
                player.barrelAngle += 0.02;
            }
        }

        if (p.keyIsDown(p.UP_ARROW)) {
            if (this.aimPower < 100) {
                this.aimPower += 2;
                this.aiming = true;
            }
        } else if (p.keyIsDown(p.DOWN_ARROW)) {
            if (this.aimPower > 20) {
                this.aimPower -= 2;
                this.aiming = true;
            }
        } else {
            this.aiming = false;
        }
    }
}

// function drawTurret(_tank: Tank, angle: number, p: p5) {
//     p.push();
//     // let pos = p5.Vector.fromAngle(angle).mult(10);
//     // translate(0,-20) //up to visual turret position
//     p.rotate(angle);
//     p.translate(getTurretImg().width / 2, 0);
//     p.image(getTurretImg(), 0, 0);
//     p.pop();
// }

function drawAimingArrow(tank: Tank, angle: number, p: p5) {
    p.push();

    // let pos = p5.Vector.fromAngle(angle).mult(10);
    // translate(0,-20) //up to visual turret position
    p.rotate(angle);
    p.scale(tank.aimPower / 75);
    p.translate(getImageFor("arrowEmpty").width / 2, 0);
    p.tint(255, 128);
    if (tank.aimPower < 90) {
        p.imageMode(p.CENTER);
        p.image(getImageFor("arrowEmpty"), 0, 0);
    } else {
        p.imageMode(p.CENTER);
        p.image(getImageFor("arrowFull"), 0, 0);
    }
    p.pop();
}

function makeAndCacheWhiteImageIfNecessary(
    teamColour: TeamColour,
    keyForNormal: string,
    p: p5
): p5.Image {
    const keyForWhite: string = keyForNormal + "-white";
    if (getTankImg(teamColour, keyForWhite) === undefined) {
        storeTankImageFor(
            teamColour,
            keyForWhite,
            getTankImgOrFail(teamColour, keyForNormal).get()
        );
        getTankImgOrFail(teamColour, keyForWhite).filter(p.THRESHOLD, 0);
    }
    return getTankImgOrFail(teamColour, keyForWhite);
}

export function getTankById(soughtId: TankId): Tank | null {
    if (soughtId === undefined || soughtId === null) {
        return null;
    }
    const player = getPlayer();
    if (soughtId === player.id) {
        return player;
    } else {
        return getCachedTankById(soughtId) ?? null;
    }
}
