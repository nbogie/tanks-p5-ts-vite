import p5 from 'p5';
import { worldPositionToScreenPosition } from './coordsUtils';
import { calcGroundHeightAt } from './ground';
import { getConfig } from './mainSketch';
import { Projectile } from './projectile';
import { collect } from './utils';
import { getImageFor } from './images';

//assets from https://www.kenney.nl/assets/shooting-gallery
let ducks: Duck[];
type DuckKind = 1 | 2 | 3;

interface Duck {
    originalPos: p5.Vector;
    motion: 'horizontal' | 'vertical' | 'none';
    pos: p5.Vector;
    vel: p5.Vector;
    kind: DuckKind;
    size: number;
    isDying: boolean;
    rotation: number;
    rotationSpeed: number;
    isDead: boolean;
}

export function getDucks(): Duck[] {
    return ducks;
}

export function setupDucks(p: p5) {
    if (getConfig().includeDucks) {
        createDucks(p);
        setInterval(() => maybeAddDuckToWorld(p), 5000);
    } else {
        ducks = [];
    }
}

export function maybeAddDuckToWorld(p: p5) {
    if (ducks.length < 10) {
        const duck = createDuck(p);
        ducks.push(duck);
    }
}

export function createDucks(p: p5) {
    ducks = collect(10, () => createDuck(p));
}

export function createDuck(p: p5): Duck {
    const isGroundDuck = p.random([true, false]);
    const motion = p.random(['horizontal', 'vertical', null]);
    const x = p.random(-4000, 4000);
    const y = isGroundDuck ? calcGroundHeightAt(x, p) : 200;
    const originalPos = p.createVector(x, y);
    const duck: Duck = {
        originalPos,
        motion,
        pos: originalPos.copy(),
        vel: p.createVector(0, 0),
        kind: p.random([1, 2, 3]),
        size: 40,
        isDying: false,
        rotation: 0,
        rotationSpeed: 0,
        isDead: false,
    };
    return duck;
}

export function duckTakeDamage(duck: Duck, projectile: Projectile, p: p5) {
    duck.isDying = true;
    duck.vel = p5.Vector.fromAngle(
        projectile.vel.heading() + p.random(-0.5, 0.5),
        10
    );
    duck.rotationSpeed = p.random(0.02, 0.2) * p.random([-1, 1]);
}

export function drawDucks(p: p5) {
    ducks.forEach((d) => drawDuck(d, p));
}

export function updateDucks(p: p5) {
    ducks.forEach((d) => updateDuck(d, p));
    ducks = ducks.filter((p) => !p.isDead);
}

export function imageKeyForDuckKind(kind: DuckKind) {
    return {
        1: 'duck1',
        2: 'duck2',
        3: 'duck3',
    }[kind];
}

export function drawDuck(duck: Duck, p: p5) {
    p.push();
    p.translate(worldPositionToScreenPosition(duck.pos, p));
    const sz = duck.size;

    p.translate(0, -sz / 2);
    p.rectMode(p.CENTER);
    p.imageMode(p.CENTER);
    p.scale(0.6, 0.6);
    p.rotate(duck.rotation);
    p.image(getImageFor('duckStick'), 0, 110);
    p.image(getImageFor(imageKeyForDuckKind(duck.kind)), 0, 0);
    p.pop();
}

export function updateDuck(duck: Duck, p: p5) {
    duck.pos.add(duck.vel);
    if (duck.isDying) {
        duck.vel.add(p.createVector(0, 0.6));
        duck.rotation += duck.rotationSpeed;
        if (duck.pos.y > p.height) {
            duck.isDead = true;
        }
    } else {
        if (duck.motion === 'horizontal') {
            const x =
                duck.originalPos.x +
                p.map(p.sin(p.frameCount / 40), -1, 1, -50, 50, true);
            const y = calcGroundHeightAt(x, p);
            duck.pos = p.createVector(x, y);
        }
        if (duck.motion === 'vertical') {
            const x = duck.originalPos.x;
            const y =
                duck.originalPos.y +
                p.map(p.sin(p.frameCount / 30), -1, 1, -50, 50, true);
            duck.pos = p.createVector(x, y);
        }
    }
}
