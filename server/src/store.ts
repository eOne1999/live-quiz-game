import { WebSocket } from 'ws';
import { Game } from './types';

export const players = new Map<number | string, { name: string; password: string; ws: WebSocket }>();
export const nameToId = new Map<string, number | string>();
export const games = new Map<number | string, Game>();

export let nextPlayerId = 1;
export const incrementPlayerId = () => { nextPlayerId++ };
