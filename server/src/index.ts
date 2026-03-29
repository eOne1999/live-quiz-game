import { WebSocketServer } from 'ws';
import { AuthenticatedWebSocket, WSMessage } from './types';
import { reg } from './handlers/reg';
import { createGame } from './handlers/createGame';
import { joinGame } from './handlers/joinGame';
import { startGame } from './handlers/startGame';
import { answer } from './handlers/answer';
import { disconnect } from './handlers/disconnect';

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
      case 'join_game':
        joinGame(message, ws);
        break;
      case 'start_game':
        startGame(message, ws);
        break;
      case 'answer':
        answer(message, ws);
        break;
    }
  })

  ws.on('close', () => disconnect(ws));
});
