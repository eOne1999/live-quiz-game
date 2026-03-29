import { games } from "../store";
import { AuthenticatedWebSocket, Game, IError, WSMessage } from "../types";
import { endQuestion } from "./endQuestion";

export const startGame = (message: WSMessage, ws: AuthenticatedWebSocket) => {
  const game: Game | undefined = games.get(message.data.gameId);
  const error: IError = {
    type: 'error',
    data: { message: '' },
    id: 0,
  };

  if (!ws.playerId) {
    error.data.message = 'Not authenticated';
    ws.send(JSON.stringify(error));

  } else if (!game) {
    error.data.message = 'Game not found';
    ws.send(JSON.stringify(error));

  } else if (game.hostId !== ws.playerId.toString()) {
    error.data.message = 'Player is not host';
    ws.send(JSON.stringify(error));

  } else if (game.status === 'waiting') {
    game.status = 'in_progress';
    game.currentQuestion = 0;

    const question = game.questions[0];
    const broadcast = {
      type: 'question',
      data: {
        questionNumber: 1,
        totalQuestions: game.questions.length,
        text: question.text,
        options: question.options,
        timeLimitSec: question.timeLimitSec
      },
      id: 0
    };
    game.players.forEach(player => player.ws?.send(JSON.stringify(broadcast)));
    game.questionStartTime = Date.now();
    game.questionTimer = setTimeout(() => endQuestion(game), question.timeLimitSec * 1000);
  }
};
