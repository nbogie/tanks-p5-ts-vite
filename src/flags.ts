function setupFlags() {
    redFlag = createFlag('red');
    blueFlag = createFlag('blue');

    redGoal = createGoal('red');
    blueGoal = createGoal('blue');

    scores = {
        red: 0,
        blue: 0,
    };
}

function getScoreForTeam(teamColour) {
    return scores[teamColour];
}

function drawFlags() {
    drawFlag(redFlag);
    drawFlag(blueFlag);
    drawGoal(redGoal);
    drawGoal(blueGoal);
}

function getRedFlag() {
    return redFlag;
}

function getBlueFlag() {
    return blueFlag;
}

function getGoalForFlag(flag) {
    return flag.teamColour === 'red' ? blueGoal : redGoal;
}

function flagStartPoint(teamColour) {
    const x = teamColour === 'red' ? -2000 : 2000;
    const y = calcGroundHeightAt(x) - 30;
    return createVector(x, y);
}

function goalPosition(teamColour) {
    const x = teamColour === 'red' ? -4000 : 4000;
    const y = calcGroundHeightAt(x);
    return createVector(x, y);
}

function createFlag(teamColour) {
    return {
        animFrame: random([0, 1]),
        teamColour,
        pos: flagStartPoint(teamColour),
        imageNamesStem: teamColour === 'red' ? 'flagRed' : 'flagBlue',
        vel: createVector(0, 0),
        idOfCarryingTank: null,
        hitRadius: 60,
    };
}

function createGoal(teamColour) {
    return {
        teamColour,
        pos: goalPosition(teamColour),
        hitRadius: 100,
    };
}

function drawGoal(goal) {
    push();
    const bobOffset = createVector(0, map(sin(frameCount / 23), -1, 1, -5, 5));
    translate(worldPositionToScreenPosition(goal.pos.copy().add(bobOffset)));
    const diameterScale = map(sin(frameCount / 43), -1, 1, 0.8, 1.1);
    const fillColour = color(
        goal.teamColour === 'red' ? 'tomato' : 'dodgerblue'
    );
    fillColour.setAlpha(100);
    stroke(255, 100);
    strokeWeight(10);
    fill(fillColour);
    circle(0, 0, diameterScale * goal.hitRadius * 2);
    pop();
}

function getTankById(soughtId) {
    if (soughtId === undefined || soughtId === null) {
        return null;
    }
    if (soughtId === player.id) {
        return player;
    } else {
        return cachedTanks[soughtId] ?? null;
    }
}

function computeFlagPosAndCarryingTank(flag) {
    const carryingTank = getTankById(flag.idOfCarryingTank);
    if (carryingTank === null) {
        const breezeOffset = p5.Vector.fromAngle(
            map(
                noise(frameCount / 20),
                0,
                1,
                0,
                720,
                10 * noise(1000 + frameCount / 31)
            )
        );
        return {
            pos: p5.Vector.add(flag.pos, breezeOffset),
            carryingTank: null,
        };
    } else {
        return {
            pos: carryingTank.pos.copy().add(createVector(0, -40)),
            carryingTank: carryingTank,
        };
    }
}

function drawFlag(flag) {
    push();
    const { pos, carryingTank } = computeFlagPosAndCarryingTank(flag);
    translate(worldPositionToScreenPosition(pos));
    const xScale = carryingTank?.isFacingRight ? -1 : 1;
    scale(xScale, 1);
    imageMode(CENTER);
    const img = images[flag.imageNamesStem + (flag.animFrame + 1)];
    image(img, 0, 0);
    // noFill();
    // stroke(255, 100)
    // circle(0, 0, flag.hitRadius * 2)
    // text(flag.idOfCarryingTank + " - " + (carryingTank?.id ?? "free") + " - " + (!!carryingTank), 0, -50)
    pop();
}

function updateFlags() {
    updateFlag(redFlag);
    updateFlag(blueFlag);
}

function moveFreeFlagByVelocity(flag) {
    flag.vel.add(createVector(0, 0.2));
    flag.pos.add(flag.vel);
    const groundHeight = calcGroundHeightAt(flag.pos.x);
    if (flag.pos.y > groundHeight - 30) {
        flag.pos.y = groundHeight - 30;
        flag.vel = createVector(0, 0);
    }
}

function updateFlag(flag) {
    if (frameCount % 20 === 0) {
        flag.animFrame = (flag.animFrame + 1) % 2;
    }

    if (flag.idOfCarryingTank === null) {
        moveFreeFlagByVelocity(flag);
        const collidingEnemyTank = findCollidingTankOfTeam(
            flag.pos,
            flag.hitRadius,
            flag.teamColour
        );
        if (collidingEnemyTank) {
            flag.idOfCarryingTank = collidingEnemyTank.id;
        }
    } else {
        const { pos, carryingTank } = computeFlagPosAndCarryingTank(flag);
        flag.pos = pos.copy();
        if (isFlagAtDestination(flag)) {
            scoreFlag(flag);
        }
    }
}

function isFlagAtDestination(flag) {
    const goal = getGoalForFlag(flag);
    return flag.pos.dist(goal.pos) < goal.hitRadius;
}

function scoreFlag(flag) {
    const scorerTeam = flag.teamColour === 'red' ? 'blue' : 'red';
    scores[scorerTeam]++;
    flag.pos = flagStartPoint(flag.teamColour);
    flag.idOfCarryingTank = null;
    flag.vel = p5.Vector.fromAngle(-PI / 2 + random(-0.2, 0.2), 10);
}

function findCollidingTankOfTeam(pos, hitRadius, soughtTeamColour) {
    return [player].find(
        (t) =>
            t.teamColour === soughtTeamColour &&
            t.pos.dist(pos) < hitRadius &&
            !t.isDead
    );
}

function dropFlag(flag) {
    if (flag.idOfCarryingTank) {
        const carryingTank = getTankById(flag.idOfCarryingTank);
        flag.pos = carryingTank
            ? carryingTank.pos.copy().add(createVector(0, -100))
            : createVector(300, 300);
        flag.vel = p5.Vector.fromAngle(-PI / 2 + random(-0.2, 0.2), 10);
        flag.idOfCarryingTank = null;
    }
}

function dropFlagIfPlayerCarrying() {
    const allFlags = [redFlag, blueFlag];
    allFlags.forEach((f) => {
        if (f.idOfCarryingTank === player.id) {
            dropFlag(f);
        }
    });
}
