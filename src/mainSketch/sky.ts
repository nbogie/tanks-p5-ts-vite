import p5 from 'p5';
import { lerpColours } from './colourUtils';
import { starPositionToScreenPosition } from './coordsUtils';
import { collect } from '../utils/utils';

let skyColours: p5.Color[];
let darknessRemaining = 0;
let stars: Star[];
interface Star {
    pos: p5.Vector;
    alpha: number;
    size: number;
}
export function setupSky(p: p5) {
    stars = collect(100, (ix) => createStar(p));
    const set1: p5.Color[] = [
        p.color('rgb(50,50,101)'),
        p.color('cyan'),
        p.color('pink'),
        p.color('rgb(190,151,158)'),
    ];
    const set2 = [p.color('rgb(50,50,101)'), p.color('pink')];
    skyColours = p.random([set1]); //set2
}

export function createStar(p: p5) {
    const pos = p.createVector(p.random(p.width), p.random(p.height * 0.2));
    return {
        pos,
        alpha: p.map(pos.y, 0, p.height * 0.3, 1, 0, true),
        size: p.random(1, 3),
    };
}

export function drawSky(p: p5) {
    p.background(40);
    if (darknessRemaining) {
        return;
    }

    p.push();
    p.colorMode(p.RGB);
    const stripeHeight = 3;
    for (let y = 0; y < p.height; y += stripeHeight) {
        const c = lerpColours(skyColours, y / p.height, p);
        p.fill(c);
        p.noStroke();
        p.rect(0, y, p.width, y + stripeHeight);
    }
    p.pop();
    drawStars(p);
}

export function drawStars(p: p5) {
    p.push();
    stars.forEach((s) => {
        p.push();
        p.translate(starPositionToScreenPosition(s.pos, p));
        p.stroke(255, p.random(0, s.alpha * 200));
        p.strokeWeight(s.size);
        p.point(0, 0);
        p.pop();
    });
    p.pop();
}

export function updateSky(p: p5) {
    darknessRemaining = p.max(darknessRemaining - 1, 0);
}

export function isSkyDarkened() {
    return darknessRemaining > 0;
}

export function getSkyReflectionColourUnder(pos: p5.Vector, p: p5) {
    if (isSkyDarkened()) {
        // if (abs(x - player.pos.x) < 300) {
        return 'rgba(255,165,0,0.9)';
        // }
    }
    p.push();
    p.colorMode(p.RGB);

    const c =
        pos.y > p.height * 0.33
            ? 'rgba(255,222,227,0.33)'
            : 'rgba(0,255,255,0.23)';
    // const c = lerpColours(skyColours, constrain((y + 100) / p.height, 0, 1));
    // c.setAlpha(50);
    p.pop();
    return c;
}

export function darkenSky() {
    darknessRemaining = 10;
}
