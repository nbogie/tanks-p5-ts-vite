import p5 from 'p5';
import { isSkyDarkened } from './sky';
import { getPaletteColour } from './palette';
import { getPlayer } from './player';

const terrainNoiseScale = 0.004;

export function calcGroundHeightAt(x: number, p: p5, zOffset: number = 0) {
    const noiseVal = p.noise(
        x * terrainNoiseScale,
        zOffset * terrainNoiseScale
    );
    return p.map(noiseVal, 0.1, 0.9, 680, 400, true);
}

/** 
Return the angle of the terrain at the given position, for a vehicle with a given wheelbase.
*/
export function calcGroundAngle(x: number, wheelbaseDist: number, p: p5) {
    //Given a central position, x, and a width of object to consider:
    //sample two points either side of x to find their terrain heights,
    //and find and return the angle from the left position to the right position
    const x1 = x - wheelbaseDist / 2;
    const x2 = x + wheelbaseDist / 2;
    const y1 = calcGroundHeightAt(x1, p);
    const y2 = calcGroundHeightAt(x2, p);
    const pos1 = p.createVector(x1, y1);
    const pos2 = p.createVector(x2, y2);
    //"what's the heading of a vector from pos1 to pos2?"
    return p5.Vector.sub(pos2, pos1).heading();
}

export function drawGround(p: p5) {
    p.push();

    const player = getPlayer();
    p.text('Your x pos: ' + player.pos.x.toFixed(1) + '', 50, 50);

    p.beginShape();
    p.vertex(-50, p.height / 2);
    for (
        let x = player.pos.x - p.width / 2;
        x < player.pos.x + p.width / 2;
        x++
    ) {
        const screenX = x - player.pos.x + p.width / 2;
        const y = calcGroundHeightAt(x, p);
        p.vertex(screenX, y);
    }
    p.vertex(p.width + 50, p.height / 2);
    p.vertex(p.width + 50, p.height + 20);
    p.vertex(-50, p.height + 20);

    if (isSkyDarkened()) {
        p.fill(200);
        player.drawExplosionCircle(p);
    } else {
        p.fill(getPaletteColour('grass'));
        p.noStroke();
    }
    p.endShape();

    p.pop();
    // drawMoreContours()//too slow.
}

//too slow to compute these p.noise values every frame.  we could cache them.  purely decorative and don't look great anyway.
export function drawMoreContours(p: p5) {
    const player = getPlayer();
    p.noFill();
    p.stroke(255, 50);
    for (let z = 0; z < 10; z++) {
        p.push();
        p.beginShape();
        for (
            let x = player.pos.x - p.width / 2;
            x < player.pos.x + p.width / 2;
            x++
        ) {
            const screenX = x - player.pos.x + p.width / 2;
            const y = calcGroundHeightAt(x, p, z * 10);
            p.vertex(screenX, y + z * 10);
        }
        p.endShape();
        p.pop();
    }
}
