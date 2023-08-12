import p5 from 'p5';
import { Duck } from './ducks';
import { Powerup } from './powerups';
import { DustParticle } from './dust';

let entities: Entity[] = [];

export type EntType = 'duck' | 'powerup' | 'dustParticle';

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
export interface ILife {
    life: number;
}

export interface IVelocity {
    vel: p5.Vector;
}
export interface IEntType {
    entType: EntType;
}
export type Entity = Duck | Powerup | DustParticle;

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
    entities = entities.filter(
        (e) => ('isDead' in e && !e.isDead) || ('life' in e && e.life > 0)
    );
}

export function addEntities(toAdd: Entity[]): void {
    entities.push(...toAdd);
}
export function getEntities(): Entity[] {
    return entities;
}
