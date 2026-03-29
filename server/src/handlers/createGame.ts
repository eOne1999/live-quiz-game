import { games, incrementGameId, nextGameId, players } from "../store";
import { AuthenticatedWebSocket, Game, IError, IGameCreated, Player, Question, WSMessage } from "../types";
import { generateCode } from "../utils/generateCode";

export const createGame = (message: WSMessage, ws: AuthenticatedWebSocket) => {
  const questions: Question[] = message.data.questions;
  const isValid = questions.every(q => q.options.length === 4);
  const response: IGameCreated = {
    type: 'game_created',
    data: {
      gameId: '',
      code: '',
    },
    id: 0,
  };
  const error: IError = {
    type: 'error',
    data: { message: '' },
    id: 0,
  };

  if (!ws.playerId) {
    error.data.message = 'Not authenticated';
    ws.send(JSON.stringify(error));

  } else if (!isValid) {
    error.data.message = 'Must be exactly 4 question options';
    ws.send(JSON.stringify(error));

  } else {
    const game: Game = {
      id: nextGameId.toString(),
      code: generateCode(),
      hostId: ws.playerId.toString(),
      questions: questions,
      players: [],
      currentQuestion: -1,
      status: 'waiting',
      playerAnswers: new Map<string, { answerIndex: number; timestamp: number }>(),
    }
    games.set(game.id, game);
    incrementGameId();

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
    response.data.code = game.code;
    ws.send(JSON.stringify(response));

    const updatePlayers = {
      type: 'update_players',
      data: game.players,
      id: 0
    }
    ws.send(JSON.stringify(updatePlayers));
  }
};
