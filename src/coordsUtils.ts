import p5 from "p5";
import { getPlayer } from "./player";

export function worldPositionToScreenPosition(pos: p5.Vector, p: p5) {
    return p.createVector(p.width / 2 + pos.x - getPlayer().pos.x, pos.y);
}

export function starPositionToScreenPosition(pos: p5.Vector, p: p5) {
    //parallax
    //return createVector(pos.x - (player.pos.x)/100, pos.y)
    //fixed
    return p.createVector(pos.x, pos.y);
}

export function cloudPositionToScreenPosition(
    pos: p5.Vector,
    layerIx: number,
    p: p5
) {
    if (layerIx === 0) {
        return worldPositionToScreenPosition(pos, p);
    } else {
        return p.createVector(
            p.width / 2 + pos.x - getPlayer().pos.x / 2,
            pos.y
        );
    }
}

export type ParallaxLayerIx = 0 | 1;
export function screenPositionToCloudPosition(
    sp: p5.Vector,
    layerIx: ParallaxLayerIx,
    p: p5
) {
    if (layerIx === 1) {
        const cx = sp.x + getPlayer().pos.x / 2 - p.width / 2;
        return p.createVector(cx, sp.y);
    } else {
        const cx = sp.x + getPlayer().pos.x - p.width / 2;
        return p.createVector(cx, sp.y);
    }
}

export function intVecToS(v: p5.Vector): string {
    return [v.x, v.y].map((val) => val.toFixed(0)).join(", ");
}
