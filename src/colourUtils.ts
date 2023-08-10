import p5 from 'p5';

/** Return a colour which is overallFraction (0 <-> 1) of the way through the given list of colours.

Original Author: Jeremy Douglass
*/
export function lerpColours(
    colours: p5.Color[],
    overallFraction: number,
    p: p5
) {
    if (colours.length === 1) {
        return colours[0];
    }

    //what fraction of 1 takes us between colour "stops"?
    //Example: with three colours, c1 is at 0, c2 is at 0.5, c3 is at 1, so colourStopDist is 0.5: (1 / (number of colours - 1))
    const colourStopDist = 1 / (colours.length - 1);

    //determine WHICH two colours we are between
    //However, perhaps we're perfectly at a single colour (e.g. at 0.8 with 6 colours, when stops are 0.2 apart, so c1 and c2 are both 4 (floor(0.8/0.2), and ceil of same)
    const c1 = colours[p.floor(overallFraction / colourStopDist)];
    const c2 = colours[p.ceil(overallFraction / colourStopDist)];

    const fracBetweenC1AndC2 =
        (overallFraction % colourStopDist) / colourStopDist;
    return p.lerpColor(c1, c2, fracBetweenC1AndC2);
}
