import p5 from 'p5';
import { io } from 'socket.io-client';
import { generateCameraShakeVector, updateCamera } from './cameraShake';
import { Cloud, drawClouds, setupClouds, updateClouds } from './clouds';
import { drawDucks, setupDucks, updateDucks } from './ducks';
import { drawDustParticles, updateDustParticles } from './dust';
import { drawExplosions, updateExplosions } from './explosions';
import { drawGround } from './ground';
import { drawPowerups, setupPowerups, updatePowerups } from './powerups';
import {
    Projectile,
    drawProjectiles,
    emitProjectile,
    fireProjectile,
    processReceivedBullet,
    setupProjectileSounds,
    updateProjectiles,
} from './projectile';
import { drawSky, setupSky, updateSky } from './sky';
import { drawSun } from './sun';
import { ReceivedTank, Tank } from './tank';
import { WeaponSystem, setupWeaponSystem } from './weaponSys';
import './style.css';
const config = {
    shouldTransmit: false,
    includeDucks: true,
    includePowerups: true,
};

const socket = io('https://socketioserverc7demo.neillbogie.repl.co');

const seed = 123;

let player: Tank;
const cachedTanks: Tank[] = [];
let projectiles: Projectile[] = [];
let weaponSystem: WeaponSystem;

const tankImgs: Record<string, p5.Image> = {};
const images: { [key: string]: p5.Image } = {}; //all other images
let turretImg: p5.Image;

let palette: Palette;

let clouds: Cloud[] = [];

function setupSounds(p: p5) {
    setupProjectileSounds(p);
}

function setupPalette() {
    const palette = {
        grass: 'rgb(82,180,82)',
        dirt: 'rgb(181,133,74)',
        dust: 'rgba(187,151,60,0.82)',
        cloud: 'rgba(255,255,255,0.22)',
    };
    return palette;
}
export type Palette = ReturnType<typeof setupPalette>;

export function getPaletteColour(key: keyof Palette): string {
    return palette[key];
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
        config.shouldTransmit ? 'transmit is on (t)' : 'transmit is off (t)',
        100,
        150
    );
    p.text('Weapon: ' + (weaponSystem.canFire() ? 'OK' : '...'), 100, 180);
    p.text('ammo: ' + '*'.repeat(weaponSystem.getAmmoCount()), 100, 210);
}

function loadImages(p: p5) {
    for (let i = 0; i < 5; i++) {
        const greyPath = 'tanks_tankGrey' + p.str(i + 1) + '.png';
        const imageGrey = p.loadImage('/images/' + greyPath);
        tankImgs[i] = imageGrey;
        // let navyPath = 'tanks_tankNavy' + p.str(i + 1) + '.png';
        // let imageNavy = p.loadImage('/images/' + navyPath);
        // tankImgs[i] = imageNavy;
    }

    images.bullet = p.loadImage('/images/' + 'tank_bullet2.png');
    images.shield = p.loadImage('/images/' + 'shield.png');
    images.arrowEmpty = p.loadImage('/images/' + 'tank_arrowEmpty.png');
    images.arrowFull = p.loadImage('/images/' + 'tank_arrowFull.png');
    images.crateWood = p.loadImage('/images/' + 'tanks_crateWood.png');
    images.crateArmor = p.loadImage('/images/' + 'tanks_crateArmor.png');
    images.crateAmmo = p.loadImage('/images/' + 'tanks_crateAmmo.png');
    images.crateRepair = p.loadImage('/images/' + 'tanks_crateRepair.png');
    turretImg = p.loadImage('/images/' + 'turret2.png');
    images.duck1 = p.loadImage('/images/' + 'duck_outline_target_brown.png');
    images.duck2 = p.loadImage('/images/' + 'duck_outline_target_white.png');
    images.duck3 = p.loadImage('/images/' + 'duck_outline_target_yellow.png');
    images.duckStick = p.loadImage('/images/' + 'stick_wood.png');
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
        config.shouldTransmit = !config.shouldTransmit;
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
        palette = setupPalette();
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
        drawHUDText(p);
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

export function getPlayer(): Tank {
    return player;
}

type Config = typeof config;
export function getConfig(): Config {
    return config;
}

export function getImageFor(key: string): p5.Image {
    return images[key];
}
export function getSocket() {
    return socket;
}
export function getTankImgFor(key: string): p5.Image {
    return tankImgs[key];
}

export function getProjectiles(): Projectile[] {
    return projectiles;
}

export function getTurretImg(): p5.Image {
    return turretImg;
}

export function getRandomTankImgIx(p: p5) {
    return p.random(Object.keys(tankImgs));
}

export function storeTankImageFor(key: string, imgToStore: p5.Image) {
    tankImgs[key] = imgToStore;
}

export function getWeaponSystem(): WeaponSystem {
    return weaponSystem;
}

export function deleteProjectiles(_p: p5) {
    projectiles = projectiles.filter((bullet) => !bullet.isDead);
}
