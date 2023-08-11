import p5 from 'p5';
import { ReceivedTank, Tank } from './tank';

const cachedTanks: { [tankId: string]: Tank } = {};

export function processReceivedTank(receivedTank: ReceivedTank, p: p5) {
    if (!(receivedTank.id in cachedTanks)) {
        const newTank = new Tank(
            receivedTank.pos.x,
            receivedTank.pos.y,
            receivedTank.id,
            p
        );
        cachedTanks[receivedTank.id] = newTank;
    }
    const cachedTank = cachedTanks[receivedTank.id];
    cachedTank.updateFromReceivedTank(receivedTank);
}

export function getCachedTanks(): Tank[] {
    return Object.values(cachedTanks);
}

export function getCachedTankKeys(): string[] {
    return Object.keys(cachedTanks);
}
