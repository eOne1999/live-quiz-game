import { WebSocketServer } from 'ws';
import { WSMessage } from './types';
import { reg } from './handlers/reg';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const wss = new WebSocketServer({ port: PORT });

let playerId = 1;

wss.on('listening', () => {
  console.log(`Server: ws://localhost:${PORT}/`)
});

wss.on('connection', (ws) => {
  ws.on('message', (rawData) => {
    const strData = rawData.toString();
    const message: WSMessage = JSON.parse(strData);

    switch (message.type) {
      case 'reg':
        playerId = reg(playerId, message, ws);
        break;
    }
  })

  ws.on('close', () => {
    console.log('disconnected');
  });
});
