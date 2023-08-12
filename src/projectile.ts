import p5 from 'p5';

import { shakeCamera } from './cameraShake';
import { getPowerups, powerupTakeDamage } from './powerups';
import { duckTakeDamage, getDucks } from './ducks';
import { darkenSky } from './sky';
import { calcGroundHeightAt } from './ground';
import { spawnExplosion } from './explosions';
import { worldPositionToScreenPosition } from './coordsUtils';
import { getImageFor } from './images';
import { getWeaponSystem } from './weaponSys';
import { getSocket } from './socketio';
import {
    handleKillProjectileAudio,
    maybeStartTrackingProjectileForAudio,
    updateProjectileSound,
} from './sound';
import { pick } from './utils';
import { rainbowColours } from './colourUtils';
import { getPlayer } from './player';

let projectiles: Projectile[] = [];
export type ProjectileKind = 'normal' | 'rainbow' | 'drunk';
export function randomProjectileKind(): ProjectileKind {
    const choices: ProjectileKind[] = ['drunk', 'rainbow', 'normal'];
    return pick(choices);
}

export class Projectile {
    pos: p5.Vector;
    vel: p5.Vector;
    acc: p5.Vector;
    trail: p5.Vector[];
    kind: ProjectileKind;
    isDead: boolean;

    constructor(pos: p5.Vector, vel: p5.Vector, kind: ProjectileKind, p: p5) {
        const gravityVec = p.createVector(0, 0.4);
        this.pos = pos.copy();
        this.vel = p.createVector(vel.x, vel.y);
        this.acc = gravityVec;
        this.trail = [];
        this.kind = kind;
        this.isDead = false;
    }

    draw(p: p5) {
        if (this.kind === 'rainbow') {
            this.drawRainbowTrail(p);
        } else {
            this.drawTrail(p);
        }
        p.push();
        p.translate(worldPositionToScreenPosition(this.pos, p));
        p.rotate(this.vel.heading());
        p.imageMode(p.CENTER);

        p.image(getImageFor('bullet'), 0, 0);
        p.pop();
    }

    drawTrail(p: p5) {
        p.beginShape();
        for (const tp of this.trail) {
            const wp = worldPositionToScreenPosition(tp, p);
            p.vertex(wp.x, wp.y);
        }
        p.stroke(255, 70);
        p.noFill();
        p.endShape();
    }
    drawRainbowTrail(p: p5) {
        p.push();

        const stripeSpacing = 5;

        p.translate(0, -(stripeSpacing * 7) / 2);

        for (let i = 0; i < 7; i++) {
            const colour = rainbowColours[i];
            //not quite right, each stripe shouldn't be translated directly down from the previous, rather, into the arc, perpendicular the the direction of movement at that point.
            //otherwise, when the shell is near vertical, the stripe will be very thin.
            p.translate(0, stripeSpacing);
            p.beginShape();
            for (const tp of this.trail) {
                const wp = worldPositionToScreenPosition(tp, p);
                p.vertex(wp.x, wp.y);
            }
            p.strokeWeight(stripeSpacing);
            p.stroke(colour);
            p.noFill();
            p.endShape();
        }
        p.pop();
    }

    update(p: p5) {
        this.trail.push(this.pos.copy());
        if (this.trail.length > 30) {
            this.trail.shift();
        }
        if (this.kind === 'drunk') {
            this.acc.add(p5.Vector.random2D().mult(0.1));
        }

        this.pos.add(this.vel);
        this.vel.add(this.acc);
        if (this.pos.dist(getPlayer().pos) < getPlayer().hitRadius) {
            if (this.kind !== 'rainbow') {
                getPlayer().takeDamage(this, p);
                shakeCamera();
                darkenSky();
            }
            killProjectile(this, p);
            const terrainType = this.kind === 'rainbow' ? 'rainbow' : 'tank';
            spawnExplosion(this.pos, this.vel, terrainType, p);
        }

        for (const pup of getPowerups()) {
            if (this.pos.dist(pup.pos) < pup.size && !pup.isOpened) {
                spawnExplosion(
                    this.pos,
                    this.vel,
                    pup.isOpened ? 'crateOpened' : 'crateClosed',
                    p
                );
                killProjectile(this, p);
                powerupTakeDamage(pup, this);
            }
        }

        for (const duck of getDucks()) {
            if (this.pos.dist(duck.pos) < duck.size && !duck.isDead) {
                spawnExplosion(this.pos, this.vel, 'crateClosed', p);
                killProjectile(this, p);
                duckTakeDamage(duck, this, p);
            }
        }

        const groundY = calcGroundHeightAt(this.pos.x, p);
        if (this.pos.y > groundY) {
            killProjectile(this, p);
            spawnExplosion(
                p.createVector(this.pos.x, groundY - 5),
                this.vel,
                this.kind === 'rainbow' ? 'rainbow' : 'ground',
                p
            );
        }
    }
}

export function killProjectile(projectile: Projectile, _p: p5) {
    projectile.isDead = true;
    handleKillProjectileAudio(projectile);
}

export interface ReceivedProjectile {
    pos: p5.Vector;
    vel: p5.Vector;
    kind: ProjectileKind;
}

export function processReceivedProjectile(
    receivedProjectile: ReceivedProjectile,
    p: p5
) {
    const projectile = new Projectile(
        p.createVector(receivedProjectile.pos.x, receivedProjectile.pos.y),
        receivedProjectile.vel,
        receivedProjectile.kind,
        p
    );
    getProjectiles().push(projectile);
    maybeStartTrackingProjectileForAudio(projectile, p);
}

export function emitProjectile(projectile: Projectile) {
    const b: ReceivedProjectile = {
        pos: projectile.pos,
        vel: projectile.vel,
        kind: projectile.kind,
    };
    getSocket().emit('bulletFired', b);
}

export function fireProjectile(p: p5) {
    if (!getWeaponSystem().canFire()) {
        return false;
    }
    const player = getPlayer();
    const firingAngle = player.calcFiringAngle(p);
    const vel = p5.Vector.fromAngle(firingAngle).mult(player.aimPower / 3.5);
    const turretCentrePos = p5.Vector.add(player.pos, p.createVector(0, 0)); //0, -20 ideally but needs rotated by ground
    const firePos = p5.Vector.add(
        turretCentrePos,
        p5.Vector.fromAngle(vel.heading(), 50)
    );
    const kind = getWeaponSystem().getProjectileKind();
    const projectile = new Projectile(firePos, vel, kind, p);
    getProjectiles().push(projectile);
    // applyRecoilToPlayer(projectile);

    maybeStartTrackingProjectileForAudio(projectile, p);
    getWeaponSystem().countFiring();

    return projectile;
}

export function drawProjectiles(p: p5) {
    for (const projectile of getProjectiles()) {
        projectile.draw(p);
    }
}

export function updateProjectiles(p: p5) {
    for (const projectile of getProjectiles()) {
        projectile.update(p);
    }
    updateProjectileSound(p);
    deleteProjectiles(p);
}

export function getProjectiles(): Projectile[] {
    return projectiles;
}

export function deleteProjectiles(_p: p5) {
    projectiles = projectiles.filter((projectile) => !projectile.isDead);
}
