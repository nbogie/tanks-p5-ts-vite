import p5 from 'p5';

export interface WeaponSystem {
    getAmmoCount: () => number;
    hasAmmo: () => boolean;
    canFire: () => boolean;
    countFiring: () => void;
    update: () => void;
}

export function setupWeaponSystem(p: p5): WeaponSystem {
    let ammoCount = 5;
    let lastFiredMillis: number | null = null;
    let lastRegainAmmoMillis: number | null = null;
    let ammoRegenPeriodMillis = 600;

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

    function update() {
        if (
            ammoCount < 5 &&
            (lastRegainAmmoMillis ?? 0) + ammoRegenPeriodMillis < p.millis()
        ) {
            lastRegainAmmoMillis = p.millis();
            ammoCount++;
        }
    }

    const weaponSystem: WeaponSystem = {
        getAmmoCount,
        hasAmmo,
        canFire,
        countFiring,
        update,
    };
    return weaponSystem;
}
