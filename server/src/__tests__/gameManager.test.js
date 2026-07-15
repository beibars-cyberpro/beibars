const test = require('node:test');
const assert = require('node:assert/strict');
const { computeRoundResults, Room, generateRoomCode, QUESTION_TIME_LIMIT_MS } = require('../gameManager');

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
