const config = {
    shouldTransmit: false,
    includeDucks: true,
    includePowerups: true,
    shouldDrawMiniMapCoords: false,
    shouldDrawMiniMap: true,
};

type Config = typeof config;

export function getConfig(): Config {
    return config;
}

export function getConfigValue<T extends keyof Config>(key: T): Config[T] {
    return config[key];
}

//TODO: limit this to the config props which are boolean
export function toggleConfig(key: keyof Config) {
    config[key] = !config[key];
}
