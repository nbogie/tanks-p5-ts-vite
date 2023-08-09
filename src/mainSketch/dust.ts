import p5 from 'p5';
import { calcGroundHeightAt } from './ground';
import { worldPositionToScreenPosition } from './coordsUtils';
import { getPaletteColour } from './mainSketch';

let dustParticles: DustParticle[] = [];

export function fireDustParticle(
    srcPos: p5.Vector,
    srcSpeed: number,
    bodyAngle: number,
    p: p5
) {
    const vel = p5.Vector.fromAngle(
        bodyAngle /*  + random(-0.1, 0.1) */,
        p.abs(srcSpeed * 3)
    );
    dustParticles.push(
        createDustParticle(p5.Vector.random2D().mult(10).add(srcPos), vel, p)
    );
}

interface DustParticle {
    pos: p5.Vector;
    vel: p5.Vector;
    size: number;
    rotation: number;
    rotationSpeed: number;
    colour: string;
    life: number;
}
export function createDustParticle(
    pos: p5.Vector,
    vel: p5.Vector,
    p: p5
): DustParticle {
    return {
        pos: pos.copy(),
        vel: vel.copy(),
        size: p.random(3, 8),
        rotation: p.random(p.TWO_PI),
        rotationSpeed: p.random(-0.2, 0.2),
        colour: getPaletteColour(p.random(['grass', 'dirt', 'dust'])),
        life: 100,
    };
}

export function drawDustParticles(p: p5) {
    for (const dp of dustParticles) {
        drawDustParticle(dp, p);
    }
}

export function updateDustParticles(p: p5) {
    for (const dp of dustParticles) {
        updateDustParticle(dp, p);
    }
    dustParticles = dustParticles.filter((dp) => dp.life > 0);
}

export function updateDustParticle(particle: DustParticle, p: p5) {
    particle.pos.add(particle.vel);
    particle.vel.add(p.createVector(0, 0.8));
    particle.life--;
    if (particle.pos.y > calcGroundHeightAt(particle.pos.x, p)) {
        particle.life -= 30;
    }
}

export function drawDustParticle(dp: DustParticle, p: p5) {
    p.push();
    p.translate(worldPositionToScreenPosition(dp.pos, p));
    p.fill(dp.colour);
    p.noStroke();
    p.circle(0, 0, dp.size);
    p.pop();
}
