import { incrementPlayerId, nameToId, nextPlayerId, players } from "../store";
import { AuthenticatedWebSocket, IReg, RegData, WSMessage } from "../types";

export const reg = (message: WSMessage, ws: AuthenticatedWebSocket) => {
  const { name, password }: RegData = message.data;
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
    incrementPlayerId();
    players.set(newId, { name, password, ws });
    nameToId.set(name, newId);
    ws.playerId = newId;
    response.data.index = newId;
    ws.send(JSON.stringify(response));

  } else {
    const existingPlayer = players.get(existingPlayerId);
    response.data.index = existingPlayerId;

    if (existingPlayer && existingPlayer.password === password) {
      existingPlayer.ws = ws;
      ws.playerId = existingPlayerId;
      ws.send(JSON.stringify(response));

    } else {
      response.data.error = true;
      response.data.errorText = 'Wrong password';
      ws.send(JSON.stringify(response));
    }
  }
}
