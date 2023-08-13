import p5 from "p5";
import { Socket, io } from "socket.io-client";
import { ReceivedProjectile, processReceivedProjectile } from "./projectile";
import { ReceivedTank } from "./tank";
import { processReceivedTank } from "./tanksCache";

let socket: Socket<ServerToClientEvents, ClientToServerEvents>;

//https://socket.io/docs/v4/typescript/
interface SharedEvents {
    tankUpdate: (tankData: ReceivedTank) => void;
    bulletFired: (receivedProjectile: ReceivedProjectile) => void;
    newClientStart: () => void;
}
interface ServerToClientEvents extends SharedEvents {
    // basicEmit: (a: number, b: string, c: Buffer) => void;
    // withAck: (d: string, callback: (e: number) => void) => void;
}
interface ClientToServerEvents extends SharedEvents {}

/** connect to socket.io server and register our listeners */
export function setupSocketIO(p: p5) {
    socket = io("https://socketioserverc7demo.neillbogie.repl.co");
    registerSocketListeners(p);
}

function registerSocketListeners(p: p5) {
    socket.on("newClientStart", () => {});
    socket.emit("newClientStart");
    socket.on("tankUpdate", (tankData: ReceivedTank) =>
        processReceivedTank(tankData, p)
    );
    socket.on("bulletFired", (receivedProjectile: ReceivedProjectile) =>
        processReceivedProjectile(receivedProjectile, p)
    );
}

export function getSocket() {
    return socket;
}
