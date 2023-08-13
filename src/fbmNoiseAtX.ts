import p5 from "p5";
import { terrainNoiseScale } from "./ground";

/** fractional brownian motion.  additive layers of noise at different frequencies.  more expensive to compute. */
export function fbmNoiseAtX(worldX: number, p: p5, zOffset: number = 0) {
    let amp = 1;
    let ampTotal = 0;
    let freqMult = 1;
    const changeInFreq = 2;
    let nTotal = 0;
    const changeInAmp = 0.6;
    for (let octaveIx = 0; octaveIx < 4; octaveIx++) {
        const noiseVal = p.noise(
            3333 * octaveIx + worldX * terrainNoiseScale * freqMult * 0.4,
            zOffset * terrainNoiseScale
        );
        nTotal += noiseVal;
        ampTotal += amp;
        amp *= changeInAmp;
        freqMult *= changeInFreq;
    }
    const normalisedTotal = nTotal / ampTotal;

    return normalisedTotal;
}
