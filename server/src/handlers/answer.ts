import { games } from "../store";
import { AnswerData, AuthenticatedWebSocket, Game, IError, WSMessage } from "../types";

export const answer = (message: WSMessage, ws: AuthenticatedWebSocket) => {
  const answerData: AnswerData = message.data;
  const game: Game | undefined = games.get(answerData.gameId);
  const questionIndex = answerData.questionIndex;
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

  } else if (questionIndex !== game.currentQuestion) {
    error.data.message = 'Not current question';
    ws.send(JSON.stringify(error));

  } else if (game.status === 'in_progress') {
    const answered = game.playerAnswers.has(ws.playerId.toString());
    if (!answered) {
      game.playerAnswers.set(ws.playerId.toString(), { answerIndex: answerData.answerIndex, timestamp: Date.now() })

      const response = {
        type: 'answer_accepted',
        data: {
          questionIndex: questionIndex,
        },
        id: 0
      }
      ws.send(JSON.stringify(response));
    }
  }
};
