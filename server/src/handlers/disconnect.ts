import { games } from "../store";
import { AuthenticatedWebSocket } from "../types";
import { endQuestion } from "./endQuestion";

export const disconnect = (ws: AuthenticatedWebSocket) => {
  if (!ws.playerId) return;
  let player = undefined;

  for (const game of games.values()) {
    player = game.players.find(p => p.index === ws.playerId?.toString());
    if (player) {
      game.players = game.players.filter(p => p.index !== ws.playerId?.toString());

      if (game.status !== 'finished') {
        const updatePlayers = {
          type: 'update_players',
          data: game.players.map(({ ws: _ws, ...p }) => p),
          id: 0
        };
        game.players.forEach(p => p.ws?.send(JSON.stringify(updatePlayers)));

        if (game.status === 'in_progress') {
          const activePlayers = game.players.filter(p => p.index !== game.hostId);
          if (game.playerAnswers.size === activePlayers.length) {
            endQuestion(game);
          }
        }
      }
      break;
    }
  }
};
