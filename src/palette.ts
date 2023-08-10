let palette: Palette;

export function setupPalette() {
    palette = createPalette();
}

export type Palette = ReturnType<typeof createPalette>;
function createPalette() {
    return {
        grass: 'rgb(82,180,82)',
        dirt: 'rgb(181,133,74)',
        dust: 'rgba(187,151,60,0.82)',
        cloud: 'rgba(255,255,255,0.22)',
    };
}

export function getPaletteColour(key: keyof Palette): string {
    return palette[key];
}
