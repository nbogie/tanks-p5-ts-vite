import p5 from 'p5';
import { ParallaxLayerIx, cloudPositionToScreenPosition } from './coordsUtils';
import { getPaletteColour } from './palette';
import { getPlayer } from './player';
import { getSkyReflectionColourUnder } from './sky';
import { collect } from './utils';

let clouds: Cloud[] = [];

export function setupClouds(p: p5): void {
    clouds = collect(100, () => createCloud(p));
}

export interface Cloud {
    pos: p5.Vector;
    vel: p5.Vector;
    layerIx: ParallaxLayerIx;
    w: number;
    h: number;
    colour: string;
    isDead: boolean;
    density: number;
}

export function calcCloudHeightAt(x: number, layerIx: number, p: p5) {
    const cloudNoiseScale = 0.0001;
    return (
        p.map(
            p.noise(20313 + layerIx * 99990 + x * cloudNoiseScale),
            0.1,
            0.9,
            0,
            p.height * 0.8,
            true
        ) + p.random(-50, 50)
    );
}

export function calcCloudDensityAt(x: number, layerIx: number, p: p5) {
    const cloudDensityScale = 0.001;
    return p.noise(999 + layerIx * 444477 + x * cloudDensityScale);
}

export function randomCloudXForLayer(layerIx: ParallaxLayerIx, p: p5): number {
    const x = p.random(-4000, 4000);
    return layerIx === 0 ? x : x * 2;
}

export function createCloud(p: p5) {
    const layerIx: ParallaxLayerIx = p.random([0, 1, 1] as ParallaxLayerIx[]);
    const x = randomCloudXForLayer(layerIx, p);
    const y = calcCloudHeightAt(x, layerIx, p);
    const pos = p.createVector(x, y);
    const vel = p.createVector(p.random(0.001, 0.2) * p.random([-1, 1]), 0);
    const density = calcCloudDensityAt(x, layerIx, p);

    const w = p.random(200, 400);
    const h = w / p.random(1.4, 4);
    return {
        pos: pos.copy(),
        vel: vel.copy(),
        layerIx,
        w,
        h,
        colour: getPaletteColour('cloud'),
        isDead: false,
        density,
    };
}

export function drawClouds(p: p5) {
    for (const cloud of clouds) {
        drawCloud(cloud, p);
    }
}

export function drawCloud(cloud: Cloud, p: p5) {
    if (cloud.density < 0.4) {
        return;
    }
    p.push();
    p.rectMode(p.CORNER);
    p.translate(cloudPositionToScreenPosition(cloud.pos, cloud.layerIx, p));
    const yScl = cloud.layerIx === 1 ? 0.7 : 1; //back clouds shorter but (perceived) longer
    p.scale(1, yScl);
    p.fill(cloud.colour);
    p.noStroke();
    const x = -cloud.w / 2;
    p.rect(x, -cloud.h, cloud.w, cloud.h);
    const liningColour = getSkyReflectionColourUnder(cloud.pos, p);
    p.fill(liningColour);
    p.rect(x, 0, cloud.w, 6);
    p.pop();
}

export function updateClouds(p: p5) {
    for (const cloud of clouds) {
        updateCloud(cloud, p);
    }

    clouds = clouds.filter((dp) => !dp.isDead);
}

export function updateCloud(cloud: Cloud, p: p5) {
    const player = getPlayer();
    cloud.pos.add(cloud.vel);
    if (cloud.layerIx === 0) {
        if (p.abs(cloud.pos.x - player.pos.x) > p.width * 4) {
            recycleCloud(cloud, p);
        }
    }
}

export function recycleCloud(cloud: Cloud, p: p5) {
    if (cloud.layerIx === 0) {
        cloud.pos.x =
            getPlayer().pos.x +
            p.random(p.width * 1.1, p.width * 2) * p.random([-1, 1]);
        cloud.pos.y = calcCloudHeightAt(cloud.pos.x, cloud.layerIx, p);
        cloud.density = calcCloudDensityAt(cloud.pos.x, cloud.layerIx, p);
    }
}
