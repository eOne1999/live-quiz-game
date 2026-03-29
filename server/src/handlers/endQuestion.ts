import { Game } from "../types";

export const endQuestion = (game: Game) => {
  clearTimeout(game.questionTimer)
  const question = game.questions[game.currentQuestion];

  const playerResults = game.players.map(player => {
    const answer = game.playerAnswers.get(player.index);
    let points = 0;

    if (answer && answer.answerIndex === question.correctIndex) {
      const timestamp = answer.timestamp;
      const timeLimitSec = question.timeLimitSec;
      const timeRemaining = timeLimitSec - (timestamp - game.questionStartTime!) / 1000;

      points = Math.round(1000 * timeRemaining / timeLimitSec);
      player.score += points;
    }
    return {
      name: player.name,
      answered: !!answer,
      correct: answer?.answerIndex === question.correctIndex,
      pointsEarned: points,
      totalScore: player.score
    };
  });

  const broadcast = {
    type: 'question_result',
    data: {
      questionIndex: game.currentQuestion,
      correctIndex: question.correctIndex,
      playerResults: playerResults,
    },
    id: 0
  }
  game.players.forEach(player => player.ws?.send(JSON.stringify(broadcast)));
  game.playerAnswers.clear();

  if (game.currentQuestion + 1 < game.questions.length) {
    game.currentQuestion++;
    const nextQuestion = game.questions[game.currentQuestion];
    setTimeout(() => {
      const broadcast = {
        type: 'question',
        data: {
          questionNumber: game.currentQuestion + 1,
          totalQuestions: game.questions.length,
          text: nextQuestion.text,
          options: nextQuestion.options,
          timeLimitSec: nextQuestion.timeLimitSec
        },
        id: 0
      };
      game.players.forEach(player => player.ws?.send(JSON.stringify(broadcast)));
      game.questionStartTime = Date.now();
      game.questionTimer = setTimeout(() => endQuestion(game), nextQuestion.timeLimitSec * 1000);
    }, 3000)

  } else {
    game.status = 'finished';
    const broadcast = {
      type: 'game_finished',
      data: {
        scoreboard: game.players
          .sort((a, b) => b.score - a.score)
          .map((player, index) => ({
            name: player.name,
            score: player.score,
            rank: index + 1
          }))
      },
      id: 0
    }
    game.players.forEach(player => player.ws?.send(JSON.stringify(broadcast)));
  }
};
