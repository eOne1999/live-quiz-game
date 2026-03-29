import type { WebSocket } from 'ws';

export interface AuthenticatedWebSocket extends WebSocket {
  playerId?: number | string;
}

export interface Player {
  name: string;
  index: string;
  score: number;
  ws?: WebSocket;
  hasAnswered?: boolean;
  answerTime?: number;
  answeredCorrectly?: boolean;
}

export interface Question {
  text: string;
  options: string[];
  correctIndex: number;
  timeLimitSec: number;
}

export interface Game {
  id: string;
  code: string;
  hostId: string;
  questions: Question[];
  players: Player[];
  currentQuestion: number;
  status: 'waiting' | 'in_progress' | 'finished';
  questionStartTime?: number;
  questionTimer?: NodeJS.Timeout;
  playerAnswers: Map<string, { answerIndex: number; timestamp: number }>;
}

export interface User {
  name: string;
  password: string;
  index: string;
  ws?: WebSocket;
}

export interface WSMessage {
  type: string;
  data: any;
  id: number;
}

export interface RegData {
  name: string;
  password: string;
}

export interface CreateGameData {
  questions: Question[];
}

export interface JoinGameData {
  code: string;
}

export interface StartGameData {
  gameId: string;
}

export interface AnswerData {
  gameId: string;
  questionIndex: number;
  answerIndex: number;
}

export interface IError {
  type: 'error',
  data: { message: string },
  id: 0,
}

export interface IReg {
  type: 'reg',
  data: {
    name: string,
    index: number | string,
    error: boolean,
    errorText: string,
  },
  id: 0;
}

export interface IGameCreated {
  type: 'game_created',
  data: {
    gameId: string,
    code: string,
  },
  id: 0;
}

export interface IGameJoined {
  type: 'game_joined',
  data: {
    gameId: string,
  },
  id: 0
}

export interface IPlayerJoined {
  type: 'player_joined',
  data: {
    playerName: string,
    playerCount: number,
  },
  id: 0
}

export interface IUpdatePlayers {
  type: 'update_players',
  data: Player[],
  id: 0
}
