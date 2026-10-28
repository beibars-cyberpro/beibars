const test = require('node:test');
const assert = require('node:assert/strict');
const {
  computeRoundResults,
  Room,
  generateRoomCode,
  shuffleQuestionOptions,
  QUESTION_TIME_LIMIT_MS,
} = require('../gameManager');

test('question time limit is 30 seconds', () => {
  assert.equal(QUESTION_TIME_LIMIT_MS, 30000);
});

const question = {
  id: 'q1',
  topic: 'Derivatives',
  question: 'Why buy a protective put?',
  options: ['Income', 'Hedge downside', 'Leverage', 'Dividend lock-in'],
  correctIndex: 1,
  explanation: 'It caps downside while keeping upside.',
};

const players = [
  { id: 'alice', name: 'Alice' },
  { id: 'bob', name: 'Bob' },
];

test('fastest correct player wins the point when both answer correctly', () => {
  const answers = new Map([
    ['alice', { optionIndex: 1, timeMs: 3000 }],
    ['bob', { optionIndex: 1, timeMs: 5000 }],
  ]);
  const { pointsByPlayer, results } = computeRoundResults(question, answers, players);
  assert.deepEqual(pointsByPlayer, { alice: 1 });
  assert.equal(results.find((r) => r.playerId === 'alice').pointsAwarded, 1);
  assert.equal(results.find((r) => r.playerId === 'bob').pointsAwarded, 0);
});

test('sole correct answerer scores regardless of speed', () => {
  const answers = new Map([
    ['alice', { optionIndex: 1, timeMs: 15000 }],
    ['bob', { optionIndex: 0, timeMs: 1000 }],
  ]);
  const { pointsByPlayer } = computeRoundResults(question, answers, players);
  assert.deepEqual(pointsByPlayer, { alice: 1 });
});

test('no correct answers means no points awarded', () => {
  const answers = new Map([
    ['alice', { optionIndex: 0, timeMs: 1000 }],
    ['bob', { optionIndex: 2, timeMs: 2000 }],
  ]);
  const { pointsByPlayer } = computeRoundResults(question, answers, players);
  assert.deepEqual(pointsByPlayer, {});
});

test('a player who never answers gets no points and null timing', () => {
  const answers = new Map([['alice', { optionIndex: 1, timeMs: 4000 }]]);
  const { results, pointsByPlayer } = computeRoundResults(question, answers, players);
  assert.deepEqual(pointsByPlayer, { alice: 1 });
  const bobResult = results.find((r) => r.playerId === 'bob');
  assert.equal(bobResult.optionIndex, null);
  assert.equal(bobResult.correct, false);
});

test('Room.recordAnswer only counts the first submission per player', () => {
  const room = new Room('TEST', 'alice');
  room.addPlayer('alice', 'Alice');
  room.startGame([question]);
  room.nextQuestion();

  assert.equal(room.recordAnswer('alice', 1), true);
  assert.equal(room.recordAnswer('alice', 0), false);
  assert.equal(room.answers.get('alice').optionIndex, 1);
});

test('generateRoomCode produces a 4-character code from the safe alphabet', () => {
  const code = generateRoomCode();
  assert.equal(code.length, 4);
  assert.match(code, /^[A-HJ-NP-Z2-9]{4}$/);
});

test('shuffleQuestionOptions keeps the same 4 option texts and the correct one still at correctIndex', () => {
  const shuffled = shuffleQuestionOptions(question);
  assert.equal(shuffled.options.length, 4);
  assert.deepEqual([...shuffled.options].sort(), [...question.options].sort());
  assert.equal(shuffled.options[shuffled.correctIndex], question.options[question.correctIndex]);
  // non-shuffle fields pass through untouched
  assert.equal(shuffled.question, question.question);
  assert.equal(shuffled.explanation, question.explanation);
});

test('shuffleQuestionOptions does not always return the same order (no fixed bias)', () => {
  const orders = new Set();
  for (let i = 0; i < 200; i++) {
    orders.add(shuffleQuestionOptions(question).options.join('|'));
  }
  // with 4! = 24 possible orders and 200 draws, seeing more than one order is
  // essentially certain unless shuffling is broken/fixed.
  assert.ok(orders.size > 1, `expected multiple distinct orders, got ${orders.size}`);
});

test('Room serves shuffled options to clients but keeps the reveal correctIndex in sync', () => {
  const room = new Room('TEST2', 'alice');
  room.addPlayer('alice', 'Alice');
  room.addPlayer('bob', 'Bob');
  room.startGame([question]);
  const served = room.nextQuestion();

  // whichever position the correct answer landed on, answering that index
  // must be recorded as correct in the reveal.
  room.recordAnswer('alice', served.correctIndex);
  room.recordAnswer('bob', served.correctIndex);
  const reveal = room.computeReveal();

  assert.equal(reveal.correctIndex, served.correctIndex);
  assert.equal(reveal.results.find((r) => r.playerId === 'alice').correct, true);
  assert.equal(reveal.results.find((r) => r.playerId === 'bob').correct, true);
});
