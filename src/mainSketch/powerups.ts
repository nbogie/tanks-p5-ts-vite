import p5 from 'p5';
import { calcGroundHeightAt } from './ground';
import { Projectile } from './projectile';
import { worldPositionToScreenPosition } from './coordsUtils';
import { collect } from '../utils/utils';
import { getConfig, getImageFor, getPlayer } from './mainSketch';

let powerups: Powerup[];

const powerupKinds: PowerupKind[] = ['armor', 'ammo', 'repair'];

type PowerupKind = 'armor' | 'ammo' | 'repair';
interface Powerup {
    pos: p5.Vector;
    vel: p5.Vector;
    kind: PowerupKind;
    size: number;
    isOpened: boolean;
    isDead: boolean;
}
export function setupPowerups(p: p5) {
    if (getConfig().includePowerups) {
        createPowerups(p);
        setInterval(() => maybeAddPowerupToWorld(p), 5000);
    } else {
        powerups = [];
    }
}

export function maybeAddPowerupToWorld(p: p5) {
    if (powerups.length < 10) {
        const pup = createPowerup(p);
        powerups.push(pup);
    }
}

export function createPowerups(p: p5) {
    powerups = collect(10, () => createPowerup(p));
}

export function createPowerup(p: p5) {
    const powerup = {
        pos: p.createVector(p.random(-4000, 4000), 200),
        vel: p.createVector(0, 0),
        kind: p.random(powerupKinds),
        size: 40,
        isOpened: p.random([false]),
        isDead: false,
    };
    return powerup;
}

export function powerupTakeDamage(
    powerup: Powerup,
    projectile: Projectile
): void {
    powerup.isOpened = true;
}

export function drawPowerups(p: p5) {
    powerups.forEach((pup) => drawPowerup(pup, p));
}

export function updatePowerups(p: p5) {
    powerups.forEach((pup) => updatePowerup(pup, p));
    powerups = powerups.filter((p) => !p.isDead);
}

export function imageKeyForPowerupKind(kind: PowerupKind) {
    return {
        ammo: 'crateAmmo',
        armor: 'crateArmor',
        repair: 'crateRepair',
    }[kind];
}

export function drawPowerup(powerup: Powerup, p: p5) {
    p.push();
    p.translate(worldPositionToScreenPosition(powerup.pos, p));
    const sz = powerup.size;

    p.translate(0, -sz / 2);
    p.rectMode(p.CENTER);
    p.imageMode(p.CENTER);
    p.fill('beige');
    p.square(0, 0, sz);
    if (powerup.isOpened) {
        p.image(getImageFor(imageKeyForPowerupKind(powerup.kind)), 0, 0);
    } else {
        p.image(getImageFor('crateWood'), 0, 0);
    }

    p.pop();
}

export function updatePowerup(pup: Powerup, p: p5) {
    pup.pos.add(pup.vel);

    handlePowerupGroundCollision(pup, p);
    handlePowerupPlayerCollision(pup, p);
}

export function handlePowerupPlayerCollision(powerup: Powerup, p: p5) {
    if (powerup.pos.dist(getPlayer().pos) < powerup.size) {
        if (powerup.isOpened) {
            if (playerCanCollectPowerup(powerup, p)) {
                playerCollectPowerup(powerup, p);
                powerup.isDead = true;
            }
        }
    }
}

export function playerCollectPowerup(powerup: Powerup, p: p5) {
    switch (powerup.kind) {
        case 'repair':
            getPlayer().health++;
            return true;
        case 'ammo':
            return false;
        case 'armor':
            return false;
        default:
            throw new Error('unexpected powerup kind: ' + powerup.kind);
    }
}

export function playerCanCollectPowerup(powerup: Powerup, p: p5) {
    if (getPlayer().isDead) {
        return false;
    }
    switch (powerup.kind) {
        case 'repair':
            return getPlayer().health < 3;
        case 'ammo':
            return true;
        case 'armor':
            return false;
        default:
            throw new Error('unexpected powerup kind: ' + powerup.kind);
    }
}

export function handlePowerupGroundCollision(pup: Powerup, p: p5) {
    const gY = calcGroundHeightAt(pup.pos.x, p);
    if (pup.pos.y >= gY) {
        pup.pos.y = gY;
        if (p.abs(pup.vel.y) > 1) {
            pup.vel.y *= -0.4;
        } else {
            pup.vel.y = 0;
        }
    } else {
        pup.vel.add(p.createVector(0, 0.5));
    }
}

export function getPowerups(): Powerup[] {
    return powerups;
}
