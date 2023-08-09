import p5 from 'p5';
import {
    cloudPositionToScreenPosition,
    worldPositionToScreenPosition,
} from './coordsUtils';
import { getSkyReflectionColourUnder } from './sky';
import { collect } from '../utils/utils';
import { getPaletteColour, getPlayer } from './mainSketch';

export function setupClouds(p: p5): Cloud[] {
    return collect(100, (ix) => createCloud(p));
}
export interface Cloud {
    pos: p5.Vector;
    vel: p5.Vector;
    layerIx: number;
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

export function createCloud(p: p5) {
    const layerIx = p.random([0, 1]);
    const x = p.random(-4000, 4000);
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

export function drawClouds(clouds: Cloud[], p: p5) {
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
    if (cloud.layerIx === 0) {
        p.translate(worldPositionToScreenPosition(cloud.pos, p));
    } else {
        p.translate(cloudPositionToScreenPosition(cloud.pos, p));
    }
    p.fill(cloud.colour);
    p.noStroke();
    const x = -cloud.w / 2;
    p.rect(x, -cloud.h, cloud.w, cloud.h);
    const liningColour = getSkyReflectionColourUnder(cloud.pos, p);
    p.fill(liningColour);
    p.rect(x, 0, cloud.w, 6);
    p.pop();
}

export function updateClouds(clouds: Cloud[], p: p5) {
    for (const cloud of clouds) {
        updateCloud(cloud, p);
    }

    clouds = clouds.filter((dp) => !dp.isDead);
}

export function updateCloud(cloud: Cloud, p: p5) {
    const player = getPlayer();
    cloud.pos.add(cloud.vel);
    if (p.abs(cloud.pos.x - player.pos.x) > p.width * 4) {
        recycleCloud(cloud, p);
    }
    // p.vel.add(createVector(0, 0.8))
}

export function recycleCloud(cloud: Cloud, p: p5) {
    cloud.pos.x =
        getPlayer().pos.x +
        p.random(p.width * 1.1, p.width * 2) * p.random([-1, 1]);
    cloud.pos.y = calcCloudHeightAt(cloud.pos.x, cloud.layerIx, p);
    cloud.density = calcCloudDensityAt(cloud.pos.x, cloud.layerIx, p);
}
