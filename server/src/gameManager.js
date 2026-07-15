const QUESTION_TIME_LIMIT_MS = 20000;
const DEFAULT_QUESTION_COUNT = 10;
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I ambiguity

function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

/**
 * Pure scoring rule: for each question, every player who chose the correct
 * option is eligible, but only the fastest of them actually scores the point
 * (the "duel" tiebreak the game is built around). No correct answers -> no
 * point awarded that round.
 */
function computeRoundResults(question, answers, players) {
  const results = [];
  const pointsByPlayer = {};
  const correctEntries = [];

  for (const player of players) {
    const answer = answers.get(player.id);
    const correct = !!answer && answer.optionIndex === question.correctIndex;
    results.push({
      playerId: player.id,
      name: player.name,
      optionIndex: answer ? answer.optionIndex : null,
      timeMs: answer ? answer.timeMs : null,
      correct,
      pointsAwarded: 0,
    });
    if (correct) correctEntries.push({ playerId: player.id, timeMs: answer.timeMs });
  }

  if (correctEntries.length > 0) {
    correctEntries.sort((a, b) => a.timeMs - b.timeMs);
    const winnerId = correctEntries[0].playerId;
    pointsByPlayer[winnerId] = 1;
    const winnerResult = results.find((r) => r.playerId === winnerId);
    if (winnerResult) winnerResult.pointsAwarded = 1;
  }

  return { results, pointsByPlayer };
}

class Room {
  constructor(code, hostId) {
    this.code = code;
    this.hostId = hostId;
    this.createdAt = Date.now();
    this.players = new Map();
    this.status = 'lobby'; // lobby | question | reveal | finished
    this.questions = [];
    this.currentIndex = -1;
    this.questionStartedAt = null;
    this.answers = new Map();
    this.timer = null;
  }

  addPlayer(id, name) {
    this.players.set(id, { id, name, score: 0, connected: true });
  }

  markDisconnected(id) {
    const p = this.players.get(id);
    if (p) p.connected = false;
  }

  connectedPlayers() {
    return this.playersList().filter((p) => p.connected);
  }

  playersList() {
    return [...this.players.values()];
  }

  currentQuestion() {
    return this.questions[this.currentIndex];
  }

  startGame(questions) {
    this.questions = questions;
    this.currentIndex = -1;
    for (const p of this.players.values()) p.score = 0;
  }

  nextQuestion() {
    this.currentIndex += 1;
    this.answers = new Map();
    this.questionStartedAt = Date.now();
    this.status = 'question';
    return this.currentQuestion();
  }

  recordAnswer(playerId, optionIndex) {
    if (this.status !== 'question') return false;
    if (this.answers.has(playerId)) return false;
    const elapsed = Date.now() - this.questionStartedAt;
    const timeMs = Math.max(0, Math.min(elapsed, QUESTION_TIME_LIMIT_MS));
    this.answers.set(playerId, { optionIndex, timeMs });
    return true;
  }

  hasEveryoneAnswered() {
    const connected = this.connectedPlayers();
    return connected.length > 0 && connected.every((p) => this.answers.has(p.id));
  }

  computeReveal() {
    const question = this.currentQuestion();
    const { results, pointsByPlayer } = computeRoundResults(question, this.answers, this.playersList());

    for (const [playerId, points] of Object.entries(pointsByPlayer)) {
      const player = this.players.get(playerId);
      if (player) player.score += points;
    }

    this.status = 'reveal';
    return {
      questionIndex: this.currentIndex,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      results,
      scores: this.playersList().map((p) => ({ playerId: p.id, name: p.name, score: p.score })),
    };
  }

  isLastQuestion() {
    return this.currentIndex >= this.questions.length - 1;
  }
}

module.exports = {
  Room,
  computeRoundResults,
  generateRoomCode,
  QUESTION_TIME_LIMIT_MS,
  DEFAULT_QUESTION_COUNT,
};
