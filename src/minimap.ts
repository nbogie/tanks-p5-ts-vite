import p5 from 'p5';
import { getPlayer } from './mainSketch';
import { getDucks } from './ducks';
import { getPowerups } from './powerups';
import { getConfig, getConfigValue } from './config';
import { getCachedTanks } from './tanksCache';
import { getRedFlag, getBlueFlag } from './flags';

const minimapConfig = {
    width: 300,
    height: 100,
};

function worldPositionToMiniMapPosition(pos: p5.Vector, p: p5) {
    return p.createVector(
        (pos.x - getPlayer().pos.x) / 20,
        (minimapConfig.height * pos.y) / p.height
    );
}

function isOnMiniMap(mpos: p5.Vector, p: p5) {
    return p.abs(mpos.x) < minimapConfig.width / 2; //&& mpos.y > 0 && mpos.y < minimapConfig.height;
}

function drawMiniMapChrome(p: p5) {
    p.push();
    p.translate(0, minimapConfig.height / 2);
    p.rectMode(p.CENTER);
    p.fill('rgba(255,255,255,0.15)');
    p.strokeWeight(1);
    p.stroke('white');
    p.rect(0, 0, minimapConfig.width, minimapConfig.height, 10);
    p.pop();
}

export function drawMiniMap(p: p5) {
    if (!getConfigValue('shouldDrawMiniMap')) {
        return;
    }
    p.push();
    p.translate(400, p.height - minimapConfig.height);
    drawMiniMapChrome(p);

    const itemsToDraw = [
        {
            collection: getDucks(),
            colour: 'rgb(151,93,33)',
        },
        {
            collection: getPowerups(),
            colour: 'gray',
        },
        {
            collection: getCachedTanks(),
            colour: 'yellow',
        },
        {
            collection: [getRedFlag()],
            colour: 'red',
        },
        {
            collection: [getBlueFlag()],
            colour: 'dodgerblue',
        },
        {
            collection: [getPlayer()],
            colour: 'white',
        },
    ];

    for (const { collection, colour } of itemsToDraw) {
        for (const item of collection) {
            if (!item || !item.pos) {
                debugger;
            }
            const mPos = worldPositionToMiniMapPosition(item.pos, p);

            if (!isOnMiniMap(mPos, p)) {
                continue;
            }
            p.push();
            p.translate(mPos);
            p.noStroke();
            p.fill(colour);
            p.circle(0, 0, 6);
            if (getConfig().shouldDrawMiniMapCoords) {
                p.textSize(7);
                p.text(vecToString(mPos, 0), 0, 10);
            }
            p.pop();
        }
    }

    function vecToString(vec: p5.Vector, precision: number) {
        return vec.x.toFixed(precision) + ', ' + vec.y.toFixed(precision);
    }

    p.push();
    p.translate(worldPositionToMiniMapPosition(getPlayer().pos, p));
    p.noStroke();
    p.fill('white');
    p.circle(0, 0, 6);
    p.pop();

    p.pop();
}
