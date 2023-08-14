import p5 from "p5";
import { worldPositionToScreenPosition } from "./coordsUtils";
import { calcGroundHeightAt } from "./ground";
import { getImageFor } from "./images";
import { TankId, getTankById } from "./tank";
import { getPlayer } from "./player";
import { getConfigValue } from "./config";
const flagStartDist = getConfigValue("flagStartDistance");
const goalStartDist = getConfigValue("goalStartDistance");

let redFlag: Flag;
let blueFlag: Flag;
let redGoal: Goal;
let blueGoal: Goal;
let scores: Scores;
let _cachedP5: p5 = undefined!;

export interface Flag {
    animFrame: 0 | 1;
    teamColour: TeamColour;
    pos: p5.Vector;
    vel: p5.Vector;
    imageNamesStem: string;
    idOfCarryingTank: TankId | null;
    hitRadius: number;
}
export interface Goal {
    teamColour: TeamColour;
    pos: p5.Vector;
    hitRadius: number;
}
type Scores = Record<TeamColour, number>;
export type TeamColour = "red" | "blue";
export const allTeamColours: TeamColour[] = ["red", "blue"];

export function setupFlags(p: p5) {
    _cachedP5 = p;

    redFlag = createFlag("red");
    blueFlag = createFlag("blue");

    redGoal = createGoal("red");
    blueGoal = createGoal("blue");

    scores = {
        red: 0,
        blue: 0,
    };
}
function getP5() {
    return _cachedP5;
}

export function getScoreForTeam(teamColour: TeamColour) {
    return scores[teamColour];
}

export function drawFlags() {
    drawFlag(redFlag);
    drawFlag(blueFlag);
    drawGoal(redGoal);
    drawGoal(blueGoal);
}

export function getRedFlag(): Flag {
    return redFlag;
}

export function getBlueFlag(): Flag {
    return blueFlag;
}

function getGoalForFlag(flag: Flag): Goal {
    return flag.teamColour === "red" ? blueGoal : redGoal;
}

function flagStartPoint(teamColour: TeamColour): p5.Vector {
    const p = getP5();
    const x = teamColour === "red" ? -flagStartDist : flagStartDist;
    const y = calcGroundHeightAt(x, p) - 30;
    return p.createVector(x, y);
}

function goalPosition(teamColour: TeamColour): p5.Vector {
    const p = getP5();
    const x = teamColour === "red" ? -goalStartDist : goalStartDist;
    const y = calcGroundHeightAt(x, p);
    return p.createVector(x, y);
}

function createFlag(teamColour: TeamColour): Flag {
    const p = getP5();
    return {
        animFrame: p.random([0, 1]),
        teamColour,
        pos: flagStartPoint(teamColour),
        imageNamesStem: teamColour === "red" ? "flagRed" : "flagBlue",
        vel: p.createVector(0, 0),
        idOfCarryingTank: null,
        hitRadius: 60,
    };
}

function createGoal(teamColour: TeamColour): Goal {
    return {
        teamColour,
        pos: goalPosition(teamColour),
        hitRadius: 100,
    };
}

function drawGoal(goal: Goal) {
    const p = getP5();
    p.push();
    const bobOffset = p.createVector(
        0,
        p.map(p.sin(p.frameCount / 23), -1, 1, -5, 5)
    );
    p.translate(
        worldPositionToScreenPosition(goal.pos.copy().add(bobOffset), p)
    );
    const diameterScale = p.map(p.sin(p.frameCount / 43), -1, 1, 0.8, 1.1);
    const fillColour = p.color(
        goal.teamColour === "red" ? "tomato" : "dodgerblue"
    );
    fillColour.setAlpha(100);
    p.stroke(255, 100);
    p.strokeWeight(10);
    p.fill(fillColour);
    p.circle(0, 0, diameterScale * goal.hitRadius * 2);
    p.pop();
}

function computeFlagPosAndCarryingTank(flag: Flag) {
    const p = getP5();
    const carryingTank = flag.idOfCarryingTank
        ? getTankById(flag.idOfCarryingTank)
        : null;
    if (carryingTank === null) {
        const breezeOffset = p5.Vector.fromAngle(
            p.map(p.noise(p.frameCount / 50), 0, 1, 0, p.TWO_PI * 2),
            10 * p.noise(1000 + p.frameCount / 30) //TODO: this was ignored in previous
        );
        return {
            pos: p5.Vector.add(flag.pos, breezeOffset),
            carryingTank: null,
        };
    } else {
        return {
            pos: carryingTank.pos.copy().add(p.createVector(0, -40)),
            carryingTank: carryingTank,
        };
    }
}
export function getOppositeTeamColour(teamColour: TeamColour): TeamColour {
    return teamColour === "red" ? "blue" : "red";
}

function drawFlag(flag: Flag) {
    const p = getP5();
    p.push();
    const { pos, carryingTank } = computeFlagPosAndCarryingTank(flag);
    p.translate(worldPositionToScreenPosition(pos, p));
    const xScale = carryingTank?.isFacingRight ? -1 : 1;
    p.scale(xScale, 1);
    p.imageMode(p.CENTER);
    const img = getImageFor(flag.imageNamesStem + (flag.animFrame + 1));
    p.image(img, 0, 0);
    // p.noFill();
    // p.stroke(255, 100)
    // p.circle(0, 0, flag.hitRadius * 2)
    // p.text(flag.idOfCarryingTank + " - " + (carryingTank?.id ?? "free") + " - " + (!!carryingTank), 0, -50)
    p.pop();
}

export function updateFlags() {
    updateFlag(redFlag);
    updateFlag(blueFlag);
}

function moveFreeFlagByVelocity(flag: Flag) {
    const p = getP5();
    flag.vel.add(p.createVector(0, 0.2));
    flag.pos.add(flag.vel);
    const groundHeight = calcGroundHeightAt(flag.pos.x, p);
    if (flag.pos.y > groundHeight - 30) {
        flag.pos.y = groundHeight - 30;
        flag.vel = p.createVector(0, 0);
    }
}

function updateFlag(flag: Flag) {
    if (getP5().frameCount % 20 === 0) {
        flag.animFrame = ((flag.animFrame + 1) % 2) as 0 | 1;
    }

    if (flag.idOfCarryingTank === null) {
        moveFreeFlagByVelocity(flag);
        const collidingEnemyTank = findCollidingTankOfTeam(
            flag.pos,
            flag.hitRadius,
            getOppositeTeamColour(flag.teamColour)
        );
        if (collidingEnemyTank) {
            flag.idOfCarryingTank = collidingEnemyTank.id;
        }
    } else {
        const { pos } = computeFlagPosAndCarryingTank(flag);
        flag.pos = pos.copy();
        if (isFlagAtDestination(flag)) {
            scoreFlag(flag);
        }
    }
}

function isFlagAtDestination(flag: Flag) {
    const goal = getGoalForFlag(flag);
    return flag.pos.dist(goal.pos) < goal.hitRadius;
}

function scoreFlag(flag: Flag) {
    const p = getP5();
    const scorerTeam = getOppositeTeamColour(flag.teamColour);
    scores[scorerTeam]++;
    flag.pos = flagStartPoint(flag.teamColour);
    flag.idOfCarryingTank = null;
    flag.vel = p5.Vector.fromAngle(-p.PI / 2 + p.random(-0.2, 0.2), 10);
}

function findCollidingTankOfTeam(
    pos: p5.Vector,
    hitRadius: number,
    soughtTeamColour: TeamColour
) {
    return [getPlayer()].find(
        (t) =>
            t.teamColour === soughtTeamColour &&
            t.pos.dist(pos) < hitRadius &&
            !t.isDead
    );
}

function dropFlag(flag: Flag) {
    const p = getP5();
    if (flag.idOfCarryingTank) {
        const carryingTank = getTankById(flag.idOfCarryingTank);
        flag.pos = carryingTank
            ? carryingTank.pos.copy().add(p.createVector(0, -100))
            : p.createVector(300, 300);
        flag.vel = p5.Vector.fromAngle(-p.PI / 2 + p.random(-0.2, 0.2), 10);
        flag.idOfCarryingTank = null;
    }
}

export function dropFlagIfPlayerCarrying() {
    const allFlags = [redFlag, blueFlag];
    allFlags.forEach((f) => {
        if (f.idOfCarryingTank === getPlayer().id) {
            dropFlag(f);
        }
    });
}
