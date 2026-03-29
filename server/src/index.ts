import { WebSocketServer } from 'ws';
import { AuthenticatedWebSocket, WSMessage } from './types';
import { reg } from './handlers/reg';
import { createGame } from './handlers/createGame';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const wss = new WebSocketServer({ port: PORT });

wss.on('listening', () => {
  console.log(`Server: ws://localhost:${PORT}/`)
});

wss.on('connection', (ws: AuthenticatedWebSocket) => {
  ws.on('message', (rawData) => {
    const strData = rawData.toString();
    const message: WSMessage = JSON.parse(strData);

    switch (message.type) {
      case 'reg':
        reg(message, ws);
        break;
      case 'create_game':
        createGame(message, ws);
        break;
    }
  })

  ws.on('close', () => {
    console.log('disconnected');
  });
});
