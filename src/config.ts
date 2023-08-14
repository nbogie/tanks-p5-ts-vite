const config = {
    shouldTransmit: false,
    includeDucks: true,
    includePowerups: true,
    shouldDrawMiniMapCoords: false,
    shouldDrawMiniMap: true,
    shouldUseFBMTerrain: false,
    flagStartDistance: 1000,
    goalStartDistance: 2000,
};

type Config = typeof config;

export function getConfig(): Config {
    return config;
}

export function getConfigValue<T extends keyof Config>(key: T): Config[T] {
    return config[key];
}

//BooleanKeys<Config> is the union of the keys of all the boolean properties in Config, but not the string or numeric ones.
type BooleanKeys<T> = {
    [K in keyof T]: T[K] extends boolean ? K : never;
}[keyof T];

export function toggleConfig<K extends BooleanKeys<Config>>(key: K): boolean {
    return (config[key] = !config[key]);
}

//simpler, non-generic:
// type BooleanKeysOfConfig = {
//     [K in keyof Config]: Config[K] extends boolean ? K : never;
// }[keyof Config];
