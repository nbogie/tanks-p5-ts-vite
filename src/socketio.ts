import p5 from 'p5';
import { Socket, io } from 'socket.io-client';
import { ReceivedProjectile, processReceivedBullet } from './projectile';
import { ReceivedTank } from './tank';
import { processReceivedTank } from './tanksCache';

//https://socket.io/docs/v4/typescript/
interface ServerToClientEvents {
    newClientStart: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    tankUpdate: (tankData: ReceivedTank) => void;
    bulletFired: (bulletData: ReceivedProjectile) => void;

    // withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
    newClientStart: () => void;
    tankUpdate: (tankData: ReceivedTank) => void;
    bulletFired: (bulletData: ReceivedProjectile) => void;
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents>;

export function setupSocketIO(p: p5) {
    socket = io('https://socketioserverc7demo.neillbogie.repl.co');
    registerSocketListeners(p);
}

function registerSocketListeners(p: p5) {
    socket.on('newClientStart', () => {});
    socket.emit('newClientStart');
    socket.on('tankUpdate', (tankData: ReceivedTank) =>
        processReceivedTank(tankData, p)
    );
    socket.on('bulletFired', (bulletData: ReceivedProjectile) =>
        processReceivedBullet(bulletData, p)
    );
}

export function getSocket() {
    return socket;
}
