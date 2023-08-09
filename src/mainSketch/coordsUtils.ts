import p5 from 'p5';
import { getPlayer } from './mainSketch';

export function worldPositionToScreenPosition(pos: p5.Vector, p: p5) {
    return p.createVector(p.width / 2 + pos.x - getPlayer().pos.x, pos.y);
}

export function starPositionToScreenPosition(pos: p5.Vector, p: p5) {
    //parallax
    //return createVector(pos.x - (player.pos.x)/100, pos.y)
    //fixed
    return p.createVector(pos.x, pos.y);
}

export function cloudPositionToScreenPosition(pos: p5.Vector, p: p5) {
    return worldPositionToScreenPosition(pos, p);
    // return createVector(width / 2 + pos.x - player.pos.x/2, pos.y)
    //this works but I need to think about recycling clouds appropriately when they're off screen.
}
