import p5 from 'p5';
import { Duck } from './ducks';
import { Powerup } from './powerups';

export type EntType = 'duck' | 'powerup';
// entType: EntType;
// isDead: boolean;

export interface IUpdatable {
    update: (p: p5) => void;
}
export interface IDrawable {
    draw: (p: p5) => void;
}
export interface IDeletable {
    isDead: boolean;
}
export interface IPosition {
    pos: p5.Vector;
}

export type Entity = Duck | Powerup;

let entities: Entity[] = [];

export function drawEntities(p: p5) {
    for (const entity of entities) {
        if ('draw' in entity) {
            entity.draw(p);
        }
    }
}
export function updateEntities(p: p5) {
    for (const entity of entities) {
        if ('update' in entity) {
            entity.update(p);
        }
    }
    entities = entities.filter((e) => !e.isDead);
}

export function addEntities(toAdd: Entity[]): void {
    entities.push(...toAdd);
}
export function getEntities(): Entity[] {
    return entities;
}
