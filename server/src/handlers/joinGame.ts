import { games, players } from "../store";
import { AuthenticatedWebSocket, Game, IError, IGameJoined, IPlayerJoined, IUpdatePlayers, Player, WSMessage } from "../types";

export const joinGame = (message: WSMessage, ws: AuthenticatedWebSocket) => {
  const code: string = message.data.code;
  let game: Game | null = null;

  const response: IGameJoined = {
    type: 'game_joined',
    data: {
      gameId: ''
    },
    id: 0
  }
  const broadcastPlayerJoined: IPlayerJoined = {
    type: 'player_joined',
    data: {
      playerName: '',
      playerCount: 0,
    },
    id: 0
  }
  const broadcastUpdatePlayers: IUpdatePlayers = {
    type: 'update_players',
    data: [],
    id: 0
  }
  const error: IError = {
    type: 'error',
    data: { message: '' },
    id: 0,
  };

  for (let [key, value] of games) {
    if (value.code === code) {
      game = value;
      break;
    }
  }

  if (!ws.playerId) {
    error.data.message = 'Not authenticated';
    ws.send(JSON.stringify(error));

  } else if (!game) {
    error.data.message = 'Game not found';
    ws.send(JSON.stringify(error));

  } else if (game.status === 'waiting') {
    const playerData = players.get(ws.playerId);
    if (!playerData) return;

    const player: Player = {
      name: playerData.name,
      index: ws.playerId.toString(),
      score: 0,
      ws: ws,
    };
    game.players.push(player);

    response.data.gameId = game.id;
    ws.send(JSON.stringify(response));

    broadcastPlayerJoined.data.playerName = player.name;
    broadcastPlayerJoined.data.playerCount = game.players.length;

    broadcastUpdatePlayers.data = game.players.map(player => {
      const { ws: _ws, ...playerWithoutWs } = player;
      return playerWithoutWs;
    });

    game.players.forEach(player => {
      player.ws?.send(JSON.stringify(broadcastPlayerJoined));
      player.ws?.send(JSON.stringify(broadcastUpdatePlayers));
    }
    );
  };
};
