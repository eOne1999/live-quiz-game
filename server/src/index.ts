import { WebSocketServer } from 'ws';
import { WebSocket } from 'ws';
import { IReg, WSMessage } from './types';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const wss = new WebSocketServer({ port: PORT });

const players = new Map<number | string, { name: string; password: string; ws: WebSocket }>();
const nameToId = new Map<string, number | string>();
let nextPlayerId = 1;

wss.on('listening', () => {
  console.log(`Server: ws://localhost:${PORT}/`)
});

wss.on('connection', (ws) => {
  ws.on('message', (rawData) => {
    const strData = rawData.toString();
    const message: WSMessage = JSON.parse(strData);

    switch (message.type) {
      case 'reg':
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
        break;
    }
  })

  ws.on('close', () => {
    console.log('disconnected');
  });
});
