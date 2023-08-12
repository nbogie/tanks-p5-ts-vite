import p5 from 'p5';
import { getConfig } from './config';
import { worldPositionToScreenPosition } from './coordsUtils';
import {
    Entity,
    IDeletable,
    IDrawable,
    IEntType,
    IPosition,
    IUpdatable,
    addEntities,
    getEntities,
} from './entities';
import { calcGroundHeightAt } from './ground';
import { getImageFor } from './images';
import { Projectile } from './projectile';
import { collect } from './utils';

//assets from https://www.kenney.nl/assets/shooting-gallery
type DuckKind = 1 | 2 | 3;

export interface Duck
    extends IDrawable,
        IUpdatable,
        IDeletable,
        IPosition,
        IEntType {
    originalPos: p5.Vector;
    motion: 'horizontal' | 'vertical' | 'none';
    vel: p5.Vector;
    kind: DuckKind;
    size: number;
    isDying: boolean;
    rotation: number;
    rotationSpeed: number;
}

export function getDucks(): Duck[] {
    return getEntities().filter(isDuck);
}

export function isDuck(ent: Entity): ent is Duck {
    return ent.entType === 'duck';
}

export function setupDucks(p: p5) {
    if (getConfig().includeDucks) {
        addEntities(createDucks(p));
        setInterval(() => maybeAddDuckToWorld(p), 5000);
    }
}

export function maybeAddDuckToWorld(p: p5) {
    if (getDucks().length < 10) {
        const duck = createDuck(p);
        addEntities([duck]);
    }
}

export function createDucks(p: p5): Duck[] {
    return collect(10, () => createDuck(p));
}

export function createDuck(p: p5): Duck {
    const isGroundDuck = p.random([true, false]);
    const motion = p.random(['horizontal', 'vertical', null]);
    const x = p.random(-4000, 4000);
    const y = isGroundDuck ? calcGroundHeightAt(x, p) : 200;
    const originalPos = p.createVector(x, y);
    const duck: Duck = {
        entType: 'duck',
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
        draw: (p: p5) => drawDuck(duck, p),
        update: (p: p5) => updateDuck(duck, p),
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
