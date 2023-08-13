import p5 from "p5";
import { pick } from "./utils";
import { allTeamColours } from "./flags";
import { Tank } from "./tank";

let player: Tank;

export function createPlayerTank(p: p5) {
    const myId = p.floor(p.random(Number.MAX_SAFE_INTEGER));
    const teamColour = pick(allTeamColours);
    player = new Tank(p.random(100, 500), 300, myId, teamColour, p);
}

export function getPlayer(): Tank {
    return player;
}
