import p5 from 'p5';
import { calcGroundAngle, calcGroundHeightAt } from './ground';
import { worldPositionToScreenPosition } from './coordsUtils';

let explosions: Explosion[] = [];

export function spawnExplosion(
    pos: p5.Vector,
    _vel: p5.Vector,
    terrainType: TerrainTypeForExplosion,
    p: p5
) {
    explosions.push({
        particles: createParticles(pos, terrainType, p),
    });
}

export type TerrainTypeForExplosion =
    | 'ground'
    | 'tank'
    | 'crateOpened'
    | 'crateClosed';
export function getPaletteForTerrainImpact(
    terrainType: TerrainTypeForExplosion
) {
    const lookup = {
        ground: ['green', 'rgb(197,122,44)', 'orange'],
        tank: [100, 150, 200, 'orange', 'tomato'],
        crateOpened: [100, 150],
        crateClosed: ['rgb(197,122,44)', 'rgb(216,179,128)'],
    };
    return lookup[terrainType];
}
interface ExplosionParticle {
    pos: p5.Vector;
    prevPos: p5.Vector;
    vel: p5.Vector;
    colour: string;
    size: number;
    rotation: number;
    framesRemaining: number;
    rotationSpeed: number;
}

interface Explosion {
    particles: ExplosionParticle[];
}

export function createParticles(
    pos: p5.Vector,
    terrainType: TerrainTypeForExplosion,
    p: p5
): ExplosionParticle[] {
    const palette = getPaletteForTerrainImpact(terrainType);
    const particles: ExplosionParticle[] = [];
    const coreAngle = calcGroundAngle(pos.x, 10, p) - p.PI / 2;

    for (let i = 0; i < 5; i++) {
        particles.push({
            pos: pos.copy(),
            prevPos: pos.copy(),
            vel: p5.Vector.fromAngle(
                coreAngle + p.random(-0.7, 0.7),
                p.random(5, 20)
            ),
            colour: p.random(palette),
            size: p.random(2, 5),
            rotation: p.random(p.TWO_PI),
            framesRemaining: p.random(30, 60),
            rotationSpeed: p.random(-0.1, 0.1),
        });
    }
    return particles;
}

export function drawExplosions(p: p5) {
    for (const e of explosions) {
        drawExplosion(e, p);
    }
}

export function drawExplosion(e: Explosion, p: p5) {
    for (const particle of e.particles) {
        drawParticle(particle, p);
    }
}

export function drawParticle(particle: ExplosionParticle, p: p5) {
    p.push();
    p.translate(worldPositionToScreenPosition(particle.pos, p));
    p.fill(particle.colour);
    p.rectMode(p.CENTER);
    p.rotate(particle.rotation);
    p.square(0, 0, particle.size * 2);
    p.pop();
}

export function updateParticle(pt: ExplosionParticle, p: p5) {
    pt.prevPos = pt.pos.copy();
    pt.pos.add(pt.vel);
    pt.rotation += pt.rotationSpeed;
    pt.vel.add(p.createVector(0, 0.8));
    if (pt.pos.y > calcGroundHeightAt(pt.pos.x, p)) {
        pt.pos = pt.prevPos.copy();
        const angle = calcGroundAngle(pt.pos.x, 10, p);
        pt.vel.reflect(p5.Vector.fromAngle(-angle));
        pt.vel.mult(0.8);
        pt.rotationSpeed = p.random(-0.1, 0.1);

        pt.framesRemaining -= 10;
    }
    pt.framesRemaining--;
}

export function updateExplosions(p: p5) {
    for (const e of explosions) {
        updateExplosion(e, p);
    }
}

export function updateExplosion(e: Explosion, p: p5) {
    for (const pt of e.particles) {
        updateParticle(pt, p);
    }
    e.particles = e.particles.filter((p) => p.framesRemaining > 0);
}
