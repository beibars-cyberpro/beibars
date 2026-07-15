const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const { getRandomQuestions, getTopics } = require('./questions');
const {
  Room,
  generateRoomCode,
  QUESTION_TIME_LIMIT_MS,
  DEFAULT_QUESTION_COUNT,
} = require('./gameManager');

const PORT = process.env.PORT || 3001;
const MIN_PLAYERS_TO_START = 2;
const MAX_QUESTION_COUNT = 40;
const MIN_QUESTION_COUNT = 3;
const ROOM_TTL_MS = 3 * 60 * 60 * 1000; // clean up abandoned rooms after 3h

const app = express();
app.use(cors());
app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/topics', (req, res) => res.json({ topics: getTopics() }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

/** @type {Map<string, Room>} */
const rooms = new Map();

function createUniqueRoomCode() {
  let code;
  do {
    code = generateRoomCode();
  } while (rooms.has(code));
  return code;
}

function roomSnapshot(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    players: room.playersList().map((p) => ({ id: p.id, name: p.name, score: p.score, connected: p.connected })),
    totalQuestions: room.questions.length,
  };
}

function broadcastRoomUpdate(room) {
  io.to(room.code).emit('room_update', roomSnapshot(room));
}

function publicQuestionPayload(room) {
  const q = room.currentQuestion();
  return {
    index: room.currentIndex,
    total: room.questions.length,
    topic: q.topic,
    question: q.question,
    options: q.options,
    timeLimitMs: QUESTION_TIME_LIMIT_MS,
    startedAt: room.questionStartedAt,
  };
}

function clearRoomTimer(room) {
  if (room.timer) {
    clearTimeout(room.timer);
    room.timer = null;
  }
}

function advanceQuestion(room) {
  clearRoomTimer(room);
  room.nextQuestion();
  io.to(room.code).emit('question', publicQuestionPayload(room));
  room.timer = setTimeout(() => revealQuestion(room), QUESTION_TIME_LIMIT_MS);
}

// Reveals the current question's answer and stops there — the host advances
// to the next question (or ends the game) explicitly via 'next_question'.
function revealQuestion(room) {
  clearRoomTimer(room);
  if (room.status !== 'question') return;
  const reveal = room.computeReveal();
  io.to(room.code).emit('reveal', reveal);
}

function finishGame(room) {
  room.status = 'finished';
  io.to(room.code).emit('game_over', {
    scores: room.playersList().map((p) => ({ playerId: p.id, name: p.name, score: p.score })),
  });
}

function sanitizeName(name) {
  if (typeof name !== 'string') return '';
  return name.trim().slice(0, 20);
}

io.on('connection', (socket) => {
  socket.on('create_room', (payload, ack) => {
    const name = sanitizeName(payload && payload.name);
    if (!name) return ack && ack({ ok: false, error: 'Введите имя' });

    const code = createUniqueRoomCode();
    const room = new Room(code, socket.id);
    room.addPlayer(socket.id, name);
    rooms.set(code, room);

    socket.join(code);
    socket.data.roomCode = code;

    ack && ack({ ok: true, code, playerId: socket.id, hostId: room.hostId });
    broadcastRoomUpdate(room);
  });

  socket.on('join_room', (payload, ack) => {
    const code = (payload && payload.code || '').toUpperCase().trim();
    const name = sanitizeName(payload && payload.name);
    const room = rooms.get(code);

    if (!room) return ack && ack({ ok: false, error: 'Комната не найдена' });
    if (!name) return ack && ack({ ok: false, error: 'Введите имя' });
    if (room.status !== 'lobby') return ack && ack({ ok: false, error: 'Игра уже началась' });

    room.addPlayer(socket.id, name);
    socket.join(code);
    socket.data.roomCode = code;

    ack && ack({ ok: true, code, playerId: socket.id, hostId: room.hostId });
    broadcastRoomUpdate(room);
  });

  socket.on('start_game', (payload, ack) => {
    const code = socket.data.roomCode;
    const room = rooms.get(code);
    if (!room) return ack && ack({ ok: false, error: 'Комната не найдена' });
    if (room.hostId !== socket.id) return ack && ack({ ok: false, error: 'Только хост может начать игру' });
    if (room.connectedPlayers().length < MIN_PLAYERS_TO_START) {
      return ack && ack({ ok: false, error: `Нужно минимум ${MIN_PLAYERS_TO_START} игрока` });
    }

    const requestedCount = Number(payload && payload.questionCount) || DEFAULT_QUESTION_COUNT;
    const questionCount = Math.max(MIN_QUESTION_COUNT, Math.min(MAX_QUESTION_COUNT, requestedCount));
    const topics = Array.isArray(payload && payload.topics) ? payload.topics : [];

    const questions = getRandomQuestions(questionCount, topics);
    if (questions.length < MIN_QUESTION_COUNT) {
      return ack && ack({ ok: false, error: 'Недостаточно вопросов для выбранных тем' });
    }

    room.startGame(questions);
    ack && ack({ ok: true });
    broadcastRoomUpdate(room);
    advanceQuestion(room);
  });

  socket.on('submit_answer', (payload, ack) => {
    const code = socket.data.roomCode;
    const room = rooms.get(code);
    if (!room) return ack && ack({ ok: false, error: 'Комната не найдена' });

    const optionIndex = Number(payload && payload.optionIndex);
    if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex > 3) {
      return ack && ack({ ok: false, error: 'Некорректный ответ' });
    }

    const recorded = room.recordAnswer(socket.id, optionIndex);
    ack && ack({ ok: recorded });
    if (!recorded) return;

    if (room.hasEveryoneAnswered()) {
      revealQuestion(room);
    }
  });

  socket.on('next_question', (payload, ack) => {
    const code = socket.data.roomCode;
    const room = rooms.get(code);
    if (!room) return ack && ack({ ok: false, error: 'Комната не найдена' });
    if (room.hostId !== socket.id) return ack && ack({ ok: false, error: 'Только хост может продолжить' });
    if (room.status !== 'reveal') return ack && ack({ ok: false, error: 'Ещё не время для следующего вопроса' });

    ack && ack({ ok: true });
    if (room.isLastQuestion()) {
      finishGame(room);
    } else {
      advanceQuestion(room);
    }
  });

  socket.on('disconnect', () => {
    const code = socket.data.roomCode;
    const room = rooms.get(code);
    if (!room) return;
    room.markDisconnected(socket.id);
    broadcastRoomUpdate(room);

    if (room.status === 'question' && room.hasEveryoneAnswered()) {
      revealQuestion(room);
    }
  });
});

// Periodic sweep of stale rooms so memory doesn't grow across long-running deployments.
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    const abandoned = room.connectedPlayers().length === 0;
    const expired = now - room.createdAt > ROOM_TTL_MS;
    if (abandoned || expired) {
      clearRoomTimer(room);
      rooms.delete(code);
    }
  }
}, 10 * 60 * 1000).unref();

server.listen(PORT, () => {
  console.log(`Quiz duel server listening on port ${PORT}`);
});

module.exports = { app, server, io };
