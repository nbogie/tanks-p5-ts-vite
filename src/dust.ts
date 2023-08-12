import p5 from 'p5';
import { worldPositionToScreenPosition } from './coordsUtils';
import {
    IDrawable,
    IEntType,
    ILife,
    IPosition,
    IUpdatable,
    IVelocity,
    addEntities,
} from './entities';
import { calcGroundHeightAt } from './ground';
import { getPaletteColour } from './palette';

export interface DustParticle
    extends IUpdatable,
        IVelocity,
        IDrawable,
        IPosition,
        ILife,
        IEntType {
    size: number;
    rotation: number;
    rotationSpeed: number;
    colour: string;
}
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
    addEntities([
        createDustParticle(p5.Vector.random2D().mult(10).add(srcPos), vel, p),
    ]);
}
export function createDustParticle(
    pos: p5.Vector,
    vel: p5.Vector,
    p: p5
): DustParticle {
    const particle: DustParticle = {
        entType: 'dustParticle',
        pos: pos.copy(),
        vel: vel.copy(),
        size: p.random(3, 8),
        rotation: p.random(p.TWO_PI),
        rotationSpeed: p.random(-0.2, 0.2),
        colour: getPaletteColour(p.random(['grass', 'dirt', 'dust'])),
        life: 100,
        draw: (p: p5) => drawDustParticle(particle, p),
        update: (p: p5) => updateDustParticle(particle, p),
    };
    return particle;
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
