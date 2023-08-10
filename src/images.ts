import p5 from 'p5';
import { tankImgs } from './mainSketch';

const images: { [key: string]: p5.Image } = {}; //all other images

export function loadImages(p: p5) {
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
    // turretImg = p.loadImage('/images/' + 'turret2.png');
    images.duck1 = p.loadImage('/images/' + 'duck_outline_target_brown.png');
    images.duck2 = p.loadImage('/images/' + 'duck_outline_target_white.png');
    images.duck3 = p.loadImage('/images/' + 'duck_outline_target_yellow.png');
    images.duckStick = p.loadImage('/images/' + 'stick_wood.png');
}

export function getImageFor(key: string): p5.Image {
    return images[key];
}
