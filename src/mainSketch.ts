import p5 from 'p5';
import { io } from 'socket.io-client';
import { generateCameraShakeVector, updateCamera } from './cameraShake';
import { Cloud, drawClouds, setupClouds, updateClouds } from './clouds';
import { drawDucks, setupDucks, updateDucks } from './ducks';
import { drawDustParticles, updateDustParticles } from './dust';
import { drawExplosions, updateExplosions } from './explosions';
import { drawGround } from './ground';
import { loadImages } from './images';
import { setupPalette } from './palette';
import { drawPowerups, setupPowerups, updatePowerups } from './powerups';
import {
    drawProjectiles,
    emitProjectile,
    fireProjectile,
    processReceivedBullet,
    setupProjectileSounds,
    updateProjectiles,
} from './projectile';
import { drawSky, setupSky, updateSky } from './sky';
import './style.css';
import { drawSun } from './sun';
import { ReceivedTank, Tank } from './tank';
import { WeaponSystem, setupWeaponSystem } from './weaponSys';
import { drawMiniMap } from './minimap';
import { getConfigValue, toggleConfig } from './config';
const socket = io('https://socketioserverc7demo.neillbogie.repl.co');

const seed = 123;

let player: Tank;
const cachedTanks: Tank[] = [];
let weaponSystem: WeaponSystem;

export const tankImgs: Record<string, p5.Image> = {};
// export let turretImg: p5.Image;

let clouds: Cloud[] = [];

new p5(createSketch);

function createSketch(p: p5) {
    //In instance mode your previously "global" variables can live here
    //(where they won't conflict with other loaded sketches)

    function preload() {
        loadImages(p);
    }

    function setup() {
        p.noiseSeed(seed);
        p.imageMode(p.CENTER);

        const myCanvas = p.createCanvas(
            p.windowWidth,
            p.min(800, p.windowHeight)
        );
        myCanvas.mousePressed(handleMousePressed);

        //not quite guaranteed unique but it'll do for now
        const myId = p.floor(p.random(999999999999));
        player = new Tank(p.random(100, 500), 300, myId, p);

        registerSocketListeners();
        setupPalette();
        weaponSystem = setupWeaponSystem(p);
        setupSounds(p);
        setupSky(p);
        clouds = setupClouds(p);
        setupPowerups(p);
        setupDucks(p);
    }

    function draw() {
        drawSky(p);

        p.translate(generateCameraShakeVector());
        drawSun(p);
        drawDucks(p);
        drawGround(p);
        for (const cTank of Object.values(cachedTanks)) {
            cTank.draw(p);
        }

        drawDustParticles(p);
        drawPowerups(p);
        player.draw(p);
        drawProjectiles(p);
        drawExplosions(p);
        drawClouds(clouds, p);
        drawMiniMap(p);
        drawHUDText(p);

        player.update(p);
        updatePowerups(p);
        updateProjectiles(p);
        updateExplosions(p);
        updateDustParticles(p);
        updateCamera(p);
        updateClouds(clouds, p);
        updateSky(p);
        updateDucks(p);
        weaponSystem.update();
    }

    function handleMousePressed() {
        if (p.mouseButton === p.LEFT) {
            p.background('white');
        }
    }

    //Crucially, assign the setup and draw functions for the p5 createSketch.
    p.setup = setup;
    p.draw = draw;
    p.preload = preload;
    p.keyPressed = (e) => keyPressed(e, p);
    p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);
}

function setupSounds(p: p5) {
    setupProjectileSounds(p);
}

function registerSocketListeners() {
    socket.on('newClientStart', () => {});
    socket.emit('newClientStart');
    socket.on('tankUpdate', processReceivedTank);
    socket.on('bulletFired', processReceivedBullet);
}

function drawHUDText(p: p5) {
    p.textSize(20);
    p.text(
        'Cached tank ids: ' +
            Object.keys(cachedTanks)
                .map((id: string) => '...' + id.slice(-4))
                .join(', '),
        100,
        120
    );
    p.text(
        getConfigValue('shouldTransmit')
            ? 'transmit is on (t)'
            : 'transmit is off (t)',
        100,
        150
    );
    p.text('Weapon: ' + (weaponSystem.canFire() ? 'OK' : '...'), 100, 180);
    p.text('ammo: ' + '*'.repeat(weaponSystem.getAmmoCount()), 100, 210);
}

function keyPressed(_event: object | undefined, p: p5) {
    // console.log("key pressed: ", { event, p });
    if (p.key === ' ') {
        if (player.isDead) {
            return;
        }
        const projectile = fireProjectile(p);
        if (projectile) {
            emitProjectile(projectile);
        }
    }
    if (p.key === 't') {
        toggleConfig('shouldTransmit');
    }
    if (p.key === 'c') {
        toggleConfig('shouldDrawMiniMapCoords');
    }
    if (p.key === 'm') {
        toggleConfig('shouldDrawMiniMap');
    }
}
function processReceivedTank(receivedTank: ReceivedTank, p: p5) {
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

export function getPlayer(): Tank {
    return player;
}

export function getSocket() {
    return socket;
}
export function getTankImgFor(key: string): p5.Image {
    return tankImgs[key];
}

export function getCachedTanks(): Tank[] {
    return Object.values(cachedTanks);
}

// export function getTurretImg(): p5.Image {
//     return turretImg;
// }

export function getRandomTankImgIx(p: p5) {
    return p.random(Object.keys(tankImgs));
}

export function storeTankImageFor(key: string, imgToStore: p5.Image) {
    tankImgs[key] = imgToStore;
}

export function getWeaponSystem(): WeaponSystem {
    return weaponSystem;
}
