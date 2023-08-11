import p5 from 'p5';
import { generateCameraShakeVector, updateCamera } from './cameraShake';
import { drawClouds, setupClouds, updateClouds } from './clouds';
import { getConfigValue, toggleConfig } from './config';
import { drawDucks, setupDucks, updateDucks } from './ducks';
import { drawDustParticles, updateDustParticles } from './dust';
import { drawExplosions, updateExplosions } from './explosions';
import { drawGround } from './ground';
import { loadImages } from './images';
import { drawMiniMap } from './minimap';
import { setupPalette } from './palette';
import { drawPowerups, setupPowerups, updatePowerups } from './powerups';
import {
    drawProjectiles,
    emitProjectile,
    fireProjectile,
    setupProjectileSounds,
    updateProjectiles,
} from './projectile';
import { drawSky, setupSky, updateSky } from './sky';
import { setupSocketIO } from './socketio';
import './style.css';
import { drawSun } from './sun';
import { Tank } from './tank';
import { getCachedTankKeys, getCachedTanks } from './tanksCache';
import {
    getWeaponSystem,
    setupWeaponSystem,
    updateWeaponSystem,
} from './weaponSys';

const seed = 123;

let player: Tank;

new p5(createSketch);

function createSketch(p: p5) {
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
        const myId = p.floor(p.random(Number.MAX_SAFE_INTEGER));
        player = new Tank(p.random(100, 500), 300, myId, p);
        setupSocketIO(p);
        setupPalette();
        setupWeaponSystem(p);
        setupSounds(p);
        setupSky(p);
        setupClouds(p);
        setupPowerups(p);
        setupDucks(p);
    }

    function draw() {
        drawSky(p);

        p.translate(generateCameraShakeVector());
        drawSun(p);
        drawDucks(p);
        drawGround(p);
        for (const cTank of getCachedTanks()) {
            cTank.draw(p);
        }

        drawDustParticles(p);
        drawPowerups(p);
        player.draw(p);
        drawProjectiles(p);
        drawExplosions(p);
        drawClouds(p);
        drawMiniMap(p);
        drawHUDText(p);

        player.update(p);
        updatePowerups(p);
        updateProjectiles(p);
        updateExplosions(p);
        updateDustParticles(p);
        updateCamera(p);
        updateClouds(p);
        updateSky(p);
        updateDucks(p);
        updateWeaponSystem(p);
    }

    function handleMousePressed() {
        if (p.mouseButton === p.LEFT) {
            //do stuff only on left mouse button
        }
    }

    //Crucially, assign the setup, draw (and other) functions for the p5 createSketch.
    //mouse pressed /dragged is set up on the canvas, not the sketch
    p.setup = setup;
    p.draw = draw;
    p.preload = preload;
    p.keyPressed = (e) => keyPressed(e, p);
    p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);
}

function setupSounds(p: p5) {
    setupProjectileSounds(p);
}

function drawHUDText(p: p5) {
    p.textSize(20);
    p.text(
        'Cached tank ids: ' +
            getCachedTankKeys()
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
    p.text('Weapon: ' + (getWeaponSystem().canFire() ? 'OK' : '...'), 100, 180);
    p.text('ammo: ' + '*'.repeat(getWeaponSystem().getAmmoCount()), 100, 210);
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

export function getPlayer(): Tank {
    return player;
}
