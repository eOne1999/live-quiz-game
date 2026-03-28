import { WebSocket } from 'ws';

export const players = new Map<number | string, { name: string; password: string; ws: WebSocket }>();
export const nameToId = new Map<string, number | string>();
