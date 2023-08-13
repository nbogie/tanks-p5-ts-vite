import p5 from "p5";
//moving to tone.js
// https://tonejs.github.io/docs/14.7.77/Signal
// https://github.com/Tonejs/Tone.js/wiki/Signals
// https://tonejs.github.io/docs/14.7.77/Oscillator.html#frequency
import * as Tone from "tone";
import { Projectile } from "./projectile";
import { getPlayer } from "./player";

let projectileForAudio: Projectile | undefined;
let projectileOsc: Tone.Oscillator;
let projectileOscAmpSignal: Tone.Signal<"number">;
let projectileOscFreqSignal: Tone.Signal<"frequency">;

export function setupSounds(p: p5) {
    setupProjectileSounds(p);
}

function setupProjectileSounds(_p: p5) {
    //  = new p5.Oscillator(440, 'sine');
    projectileOsc = new Tone.Oscillator(440, "sine").toDestination().start();
    // a scheduleable signal which can be connected to control an AudioParam or another Signal

    projectileOscFreqSignal = new Tone.Signal({
        value: "C4",
        units: "frequency",
    }).connect(projectileOsc.frequency);

    // the scheduled ramp controls the connected signal
    projectileOscAmpSignal = new Tone.Signal({
        value: -1,
    }).connect(projectileOsc.volume);

    // the scheduled ramp controls the connected signal
    // projectileOscFreqSignal.rampTo('C2', 4, '+0.5');
    projectileOscAmpSignal.rampTo(-1, 0.1);
    // projectileOsc.volume.value = 0;
}

export function maybeStartTrackingProjectileForAudio(
    projectile: Projectile,
    _p: p5
) {
    //first time use?
    if (!projectileForAudio) {
        Tone.start(); //from user gesture.
        projectileOsc.start(1);
    }
    projectileOscAmpSignal.rampTo(-1, 0.01);
    projectileOscFreqSignal.rampTo(200, 0.01);

    projectileForAudio = projectile;
}

export function updateProjectileSound(p: p5) {
    if (projectileForAudio && !projectileForAudio.isDead) {
        const pitch = p.map(
            projectileForAudio.pos.y,
            p.height,
            -2000,
            500,
            2000,
            true
        );
        if (p.frameCount % 3 === 0) {
            projectileOscFreqSignal.rampTo(pitch, 0.1);

            const velBasedAmp = p.map(
                p.abs(projectileForAudio.vel.mag()),
                7,
                20,
                0,
                0.1,
                true
            );
            const distBasedGain = p.map(
                projectileForAudio.pos.dist(getPlayer().pos),
                300,
                p.width * 0.9,
                1,
                0,
                true
            );

            const vol = p.map(
                velBasedAmp * distBasedGain,
                0,
                1,
                -1,
                -0.5,
                true
            );

            projectileOscAmpSignal.rampTo(vol, 0.1);
        }
    }
}

export function handleKillProjectileAudio(projectile: Projectile) {
    if (projectileForAudio === projectile) {
        projectileOscAmpSignal.rampTo(-1, 0.1);
    }
}
