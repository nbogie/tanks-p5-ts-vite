import p5 from 'p5';
import { ReceivedTank, Tank, TankId } from './tank';

const cachedTanks: { [tankId: string]: Tank } = {};

const disconnectedTankTimeoutSec = 10;

function getOrInsertTank(soughtTankId: TankId, creationFn: () => Tank): Tank {
    const cachedTank = cachedTanks[soughtTankId];
    if (cachedTank) {
        return cachedTank;
    }

    const newTank = creationFn();
    cachedTanks[soughtTankId] = newTank;
    return newTank;
}

export function processReceivedTank(receivedTank: ReceivedTank, p: p5) {
    const cachedTank = getOrInsertTank(
        receivedTank.id,
        () =>
            new Tank(
                receivedTank.pos.x,
                receivedTank.pos.y,
                receivedTank.id,
                receivedTank.teamColour,
                p
            )
    );

    cachedTank.updateFromReceivedTank(receivedTank, p);
}

export function getCachedTanks(): Tank[] {
    return Object.values(cachedTanks);
}

export function getCachedTankKeys(): string[] {
    return Object.keys(cachedTanks);
}

export function getCachedTankById(soughtId: TankId): Tank | undefined {
    return cachedTanks[soughtId];
}

export function drawCachedTanks(p: p5): void {
    for (const cTank of getCachedTanks()) {
        cTank.draw(p);
    }
}

export function updateCachedTanks(p: p5): void {
    const oneMinAgo = p.millis() - disconnectedTankTimeoutSec * 1000;
    for (const cTank of getCachedTanks()) {
        if (cTank.lastHeardFromAtMs < oneMinAgo) {
            removeTankFromCache(cTank);
        }
    }
}

function removeTankFromCache(tank: Tank) {
    delete cachedTanks[tank.id];
}
