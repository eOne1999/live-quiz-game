import { WebSocket } from 'ws';
import { nameToId, players } from "../store";
import { IReg, WSMessage } from "../types";

export const reg = (nextPlayerId: number, message: WSMessage, ws: WebSocket): number => {
  const { name, password } = message.data;
  const existingPlayerId = nameToId.get(name);
  const response: IReg = {
    type: 'reg',
    data: {
      name,
      index: 0,
      error: false,
      errorText: ''
    },
    id: 0
  };

  if (existingPlayerId === undefined) {
    const newId = nextPlayerId;
    nextPlayerId++;
    players.set(newId, { name, password, ws });
    nameToId.set(name, newId);
    (ws as any).playerId = newId;
    response.data.index = newId;
    ws.send(JSON.stringify(response));

  } else {
    const existingPlayer = players.get(existingPlayerId);
    response.data.index = existingPlayerId;

    if (existingPlayer && existingPlayer.password === password) {
      existingPlayer.ws = ws;
      (ws as any).playerId = existingPlayerId;
      ws.send(JSON.stringify(response));

    } else {
      response.data.error = true;
      response.data.errorText = 'Wrong password';
      ws.send(JSON.stringify(response));
    }
  }
  return nextPlayerId;
}
