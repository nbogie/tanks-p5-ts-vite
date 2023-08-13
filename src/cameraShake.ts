import p5 from "p5";

let camShakeMagnitude = 0;

export function shakeCamera() {
    camShakeMagnitude += 10;
}

export function updateCamera(p: p5) {
    camShakeMagnitude = p.max(0, camShakeMagnitude - 0.4);
}

export function generateCameraShakeVector() {
    return p5.Vector.random2D().mult(camShakeMagnitude);
}
