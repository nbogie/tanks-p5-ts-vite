import p5 from "p5";
import { getConfigValue } from "./config";
import { getCachedTankKeys } from "./tanksCache";
import { getWeaponSystem } from "./weaponSys";
import { getScoreForTeam } from "./flags";
import { getPlayer } from "./player";
import { getProjectiles } from "./projectile";

/** draw various bits of text to the canvas, to help debugging */
export function drawDebugHUD(p: p5) {
    p.push();
    p.fill(255, 100);
    p.textSize(20);

    const linesToLog = [
        "Your x pos: " + getPlayer().pos.x.toFixed(1),
        "Cached tank ids: " +
            getCachedTankKeys()
                .map((id: string) => "..." + id.slice(-4))
                .join(", "),

        "cached tanks: " + getCachedTankKeys().length,
        getConfigValue("shouldTransmit")
            ? "transmit is on (t)"
            : "transmit is off (t)",
        "Your Team: " + getPlayer().teamColour,
        "Weapon: " + (getWeaponSystem().canFire() ? "OK" : "..."),
        "ammo: " + "*".repeat(getWeaponSystem().getAmmoCount()),
        "kind: " + getWeaponSystem().getProjectileKind(),
        "score: red: " +
            getScoreForTeam("red") +
            ", blue: " +
            getScoreForTeam("blue"),
        "projectile count: " + getProjectiles().length,
    ];
    linesToLog.forEach((line, ix) => p.text(line, p.width - 200, 20 + ix * 30));
    p.pop();
}
