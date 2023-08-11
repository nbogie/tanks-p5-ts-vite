import p5 from 'p5';

//moving to tone.js
// https://tonejs.github.io/docs/14.7.77/Signal
// https://github.com/Tonejs/Tone.js/wiki/Signals
// https://tonejs.github.io/docs/14.7.77/Oscillator.html#frequency
import * as Tone from 'tone';

import { getPlayer, getSocket } from './mainSketch';
import { shakeCamera } from './cameraShake';
import { getPowerups, powerupTakeDamage } from './powerups';
import { duckTakeDamage, getDucks } from './ducks';
import { darkenSky } from './sky';
import { calcGroundHeightAt } from './ground';
import { spawnExplosion } from './explosions';
import { worldPositionToScreenPosition } from './coordsUtils';
import { getImageFor } from './images';
import { getWeaponSystem } from './weaponSys';

let projectiles: Projectile[] = [];

export class Projectile {
    pos: p5.Vector;
    vel: p5.Vector;
    acc: p5.Vector;
    trail: p5.Vector[];
    isDead: boolean;

    constructor(pos: p5.Vector, vel: p5.Vector, p: p5) {
        const gravityVec = p.createVector(0, 0.4);
        this.pos = pos.copy();
        this.vel = p.createVector(vel.x, vel.y);
        this.acc = gravityVec;
        this.trail = [];
        this.isDead = false;
    }

    draw(p: p5) {
        p.push();
        p.translate(worldPositionToScreenPosition(this.pos, p));
        p.rotate(this.vel.heading());
        p.imageMode(p.CENTER);

        p.image(getImageFor('bullet'), 0, 0);
        p.pop();
        this.drawTrail(p);
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
    update(p: p5) {
        this.trail.push(this.pos.copy());
        if (this.trail.length > 30) {
            this.trail.shift();
        }
        this.pos.add(this.vel);
        this.vel.add(this.acc);
        if (this.pos.dist(getPlayer().pos) < getPlayer().hitRadius) {
            getPlayer().takeDamage(this, p);
            shakeCamera();
            darkenSky();
            killProjectile(this, p);
            spawnExplosion(this.pos, this.vel, 'tank', p);
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
                'ground',
                p
            );
        }
    }
}

let projectileForAudio: Projectile | undefined;
let projectileOsc: Tone.Oscillator;
let projectileOscAmpSignal: Tone.Signal<'number'>;
let projectileOscFreqSignal: Tone.Signal<'frequency'>;

export function setupProjectileSounds(_p: p5) {
    //  = new p5.Oscillator(440, 'sine');
    projectileOsc = new Tone.Oscillator(440, 'sine').toDestination().start();
    // a scheduleable signal which can be connected to control an AudioParam or another Signal

    projectileOscFreqSignal = new Tone.Signal({
        value: 'C4',
        units: 'frequency',
    }).connect(projectileOsc.frequency);

    // the scheduled ramp controls the connected signal
    projectileOscAmpSignal = new Tone.Signal({
        value: -1,
    }).connect(projectileOsc.volume);

    // the scheduled ramp controls the connected signal
    // projectileOscFreqSignal.rampTo('C2', 4, '+0.5');
    projectileOscAmpSignal.rampTo(-1, 0.1);
    // projectileOsc.volume.value = 0;
}

export function killProjectile(projectile: Projectile, _p: p5) {
    projectile.isDead = true;
    if (projectileForAudio === projectile) {
        projectileOscAmpSignal.rampTo(-1, 0.1);
    }
}

export interface ReceivedProjectile {
    pos: p5.Vector;
    vel: p5.Vector;
}

export function processReceivedBullet(bullet: ReceivedProjectile, p: p5) {
    const projectile = new Projectile(
        p.createVector(bullet.pos.x, bullet.pos.y),
        bullet.vel,
        p
    );
    getProjectiles().push(projectile);
    maybeStartTrackingProjectileForAudio(projectile, p);
}

export function emitProjectile(projectile: Projectile) {
    getSocket().emit('bulletFired', {
        pos: projectile.pos,
        vel: projectile.vel,
    });
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
    const projectile = new Projectile(firePos, vel, p);
    getProjectiles().push(projectile);
    // applyRecoilToPlayer(projectile);

    maybeStartTrackingProjectileForAudio(projectile, p);
    getWeaponSystem().countFiring();

    return projectile;
}

export function maybeStartTrackingProjectileForAudio(
    projectile: Projectile,
    _p: p5
) {
    //first time use?
    if (!projectileForAudio) {
        Tone.start(); //from user gesture.
        projectileOsc.start(1);
    }
    projectileOscAmpSignal.rampTo(-1, 0.01);
    projectileOscFreqSignal.rampTo(200, 0.01);

    projectileForAudio = projectile;
}

export function drawProjectiles(p: p5) {
    for (const bullet of getProjectiles()) {
        bullet.draw(p);
    }
}

export function updateProjectiles(p: p5) {
    for (const bullet of getProjectiles()) {
        bullet.update(p);
    }
    updateProjectileSound(p);
    deleteProjectiles(p);
}

export function updateProjectileSound(p: p5) {
    if (projectileForAudio && !projectileForAudio.isDead) {
        const pitch = p.map(
            projectileForAudio.pos.y,
            p.height,
            -2000,
            500,
            2000,
            true
        );
        if (p.frameCount % 3 === 0) {
            projectileOscFreqSignal.rampTo(pitch, 0.1);

            const velBasedAmp = p.map(
                p.abs(projectileForAudio.vel.mag()),
                7,
                20,
                0,
                0.1,
                true
            );
            const distBasedGain = p.map(
                projectileForAudio.pos.dist(getPlayer().pos),
                300,
                p.width * 0.9,
                1,
                0,
                true
            );

            const vol = p.map(
                velBasedAmp * distBasedGain,
                0,
                1,
                -1,
                -0.5,
                true
            );
            false &&
                console.log({
                    velBasedAmp,
                    distBasedGain,
                    product: velBasedAmp * distBasedGain,
                    vol,
                });
            projectileOscAmpSignal.rampTo(vol, 0.1);
        }
    }
}

export function getProjectiles(): Projectile[] {
    return projectiles;
}

export function deleteProjectiles(_p: p5) {
    projectiles = projectiles.filter((bullet) => !bullet.isDead);
}
