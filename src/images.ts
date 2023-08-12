import p5 from 'p5';
import { TeamColour } from './flags';

const images: { [key: string]: p5.Image } = {}; //all other images
const tankImgs: Record<TeamColour, Record<string, p5.Image>> = {
    red: {},
    blue: {},
};
// export let turretImg: p5.Image;

export function loadImages(p: p5) {
    const pathToImages = '/images/';
    for (let ix = 0; ix < 5; ix++) {
        const greyPath = 'tanks_tankGrey' + (ix + 1) + '.png';
        const imageGrey = p.loadImage(pathToImages + greyPath);
        tankImgs['red'][ix] = imageGrey;
        const navyPath = 'tanks_tankNavy' + (ix + 1) + '.png';
        const imageNavy = p.loadImage(pathToImages + navyPath);
        tankImgs['blue'][ix] = imageNavy;
    }
    images.bullet = p.loadImage(pathToImages + 'tank_bullet2.png');
    images.shield = p.loadImage(pathToImages + 'shield.png');
    images.arrowEmpty = p.loadImage(pathToImages + 'tank_arrowEmpty.png');
    images.arrowFull = p.loadImage(pathToImages + 'tank_arrowFull.png');
    images.crateWood = p.loadImage(pathToImages + 'tanks_crateWood.png');
    images.crateArmor = p.loadImage(pathToImages + 'tanks_crateArmor.png');
    images.crateAmmo = p.loadImage(pathToImages + 'tanks_crateAmmo.png');
    images.crateRepair = p.loadImage(pathToImages + 'tanks_crateRepair.png');
    // turretImg = p.loadImage(pathToImages + 'turret2.png');
    images.duck1 = p.loadImage(pathToImages + 'duck_outline_target_brown.png');
    images.duck2 = p.loadImage(pathToImages + 'duck_outline_target_white.png');
    images.duck3 = p.loadImage(pathToImages + 'duck_outline_target_yellow.png');
    images.duckStick = p.loadImage(pathToImages + 'stick_wood.png');
    images.flagRed1 = p.loadImage(pathToImages + 'flagRed.png');
    images.flagRed2 = p.loadImage(pathToImages + 'flagRed2.png');
    images.flagBlue1 = p.loadImage(pathToImages + 'flagBlue.png');
    images.flagBlue2 = p.loadImage(pathToImages + 'flagBlue2.png');
    images.heartFull = p.loadImage(pathToImages + 'hud_heartFull.png');
    images.heartHalf = p.loadImage(pathToImages + 'hud_heartHalf.png');
    images.heartEmpty = p.loadImage(pathToImages + 'hud_heartEmpty.png');
}

export function getImageFor(key: string): p5.Image {
    const img = images[key];
    if (!img) {
        throw new Error("Can't find image for: " + key);
    }
    return img;
}

export function getTankImgOrFail(
    teamColour: TeamColour,
    key: string
): p5.Image {
    const img = getTankImg(teamColour, key);
    if (!img) {
        throw new Error(`No tank image for team: ${teamColour} key: ${key}`);
    }
    return img;
}
export function getTankImg(teamColour: TeamColour, key: string): p5.Image {
    return tankImgs[teamColour][key];
}

// export function getTurretImg(): p5.Image {
//     return turretImg;
// }

export function getRandomTankImgIxForTeam(teamColour: TeamColour, p: p5) {
    const choices = Object.keys(tankImgs[teamColour]);
    return p.random(choices);
}

export function storeTankImageFor(
    teamColour: TeamColour,
    key: string,
    imgToStore: p5.Image
) {
    tankImgs[teamColour][key] = imgToStore;
}
