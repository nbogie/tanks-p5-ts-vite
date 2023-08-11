import p5 from 'p5';
import { getConfigValue } from './config';
import { getCachedTankKeys } from './tanksCache';
import { getWeaponSystem } from './weaponSys';

/** draw various bits of text to the canvas, to help debugging */
export function drawDebugHUD(p: p5) {
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
