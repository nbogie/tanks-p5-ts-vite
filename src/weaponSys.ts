import p5 from 'p5';
import { ProjectileKind } from './projectile';
import { pick } from './utils';

export interface WeaponSystem {
    getAmmoCount: () => number;
    hasAmmo: () => boolean;
    canFire: () => boolean;
    countFiring: () => void;
    getProjectileKind: () => ProjectileKind;
    setProjectileKind: (kind: ProjectileKind) => void;
    update: () => void;
}

let weaponSystemGlobal: WeaponSystem;

export function getWeaponSystem(): WeaponSystem {
    return weaponSystemGlobal;
}

export function randomProjectileKind(): ProjectileKind {
    const choices: ProjectileKind[] = ['drunk', 'homing', 'normal'];
    return pick(choices);
}

export function updateWeaponSystem(_p: p5): void {
    weaponSystemGlobal.update();
}
export function setupWeaponSystem(p: p5): void {
    let projectileKind: ProjectileKind = 'drunk';
    let ammoCount = 5;
    let lastFiredMillis: number | null = null;
    let lastRegainAmmoMillis: number | null = null;
    const ammoRegenPeriodMillis = 600;

    function hasAmmo() {
        return ammoCount > 0;
    }

    function getAmmoCount() {
        return ammoCount;
    }

    function canFire() {
        const fireDelayMillis = 100;
        return (
            hasAmmo() &&
            (lastFiredMillis === null ||
                lastFiredMillis < p.millis() - fireDelayMillis)
        );
    }

    function countFiring() {
        ammoCount--;
        lastFiredMillis = p.millis();
        lastRegainAmmoMillis = p.millis();
    }
    function getProjectileKind() {
        return projectileKind;
    }
    function setProjectileKind(newKind: ProjectileKind): void {
        projectileKind = newKind;
    }
    function update() {
        if (
            ammoCount < 5 &&
            (lastRegainAmmoMillis ?? 0) + ammoRegenPeriodMillis < p.millis()
        ) {
            lastRegainAmmoMillis = p.millis();
            ammoCount++;
        }
    }

    const newWeaponSystem: WeaponSystem = {
        getAmmoCount,
        hasAmmo,
        canFire,
        getProjectileKind,
        setProjectileKind,
        countFiring,
        update,
    };
    weaponSystemGlobal = newWeaponSystem;
}
