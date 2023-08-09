import p5 from 'p5';

export function drawSun(p: p5) {
    p.push();
    const sunColour = 'rgba(255,255,255,0.03)';
    p.stroke(sunColour);
    p.noFill();
    p.translate(100, 100);

    //discs
    for (let i = 0; i < 10; i++) {
        const d = p.map(
            p.noise(i * 555 + p.frameCount / 953),
            0.2,
            0.8,
            20,
            500,
            true
        );
        p.strokeWeight(
            p.map(p.noise(i * 333 + p.frameCount / 30), 0, 1, 3, 30)
        );
        const discAlpha = p.map(d, 300, 400, 10, 0, true);
        p.stroke(255, discAlpha);
        p.circle(0, 0, d);
    }

    //slow-rotating beams
    p.noStroke();
    p.fill(sunColour);
    const radius = 4000;
    for (let i = 0; i < 8; i++) {
        p.rotate((i * p.PI) / 8 + p.frameCount / 4000);
        p.arc(0, 0, radius, radius, p.PI / 4, p.PI / 4 + 0.1);
    }
    p.fill('white');
    p.circle(0, 0, 100);
    p.pop();
}
