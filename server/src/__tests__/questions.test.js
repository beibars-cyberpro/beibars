const test = require('node:test');
const assert = require('node:assert/strict');
const { getAllQuestions, getTopics, getRandomQuestions } = require('../questions');

test('loads the full question bank with no duplicate ids', () => {
  const all = getAllQuestions();
  assert.equal(all.length, 1000);
  const ids = new Set(all.map((q) => q.id));
  assert.equal(ids.size, all.length);
});

test('TV Shows / The Big Bang Theory category is present with 300 questions', () => {
  const all = getAllQuestions();
  const bbt = all.filter((q) => q.topic === 'TV Shows');
  assert.equal(bbt.length, 300);
  assert.ok(bbt.every((q) => q.subtopic === 'The Big Bang Theory'));
  assert.ok(getTopics().includes('TV Shows'));
});

test('US Politics category is present with 100 questions', () => {
  const all = getAllQuestions();
  const usPol = all.filter((q) => q.topic === 'US Politics');
  assert.equal(usPol.length, 100);
  assert.ok(getTopics().includes('US Politics'));
});

test('Central Asian Politics category is present with 100 questions', () => {
  const all = getAllQuestions();
  const capol = all.filter((q) => q.topic === 'Central Asian Politics');
  assert.equal(capol.length, 100);
  assert.ok(getTopics().includes('Central Asian Politics'));
});

test('Kazakh Celebrities category is present with 100 questions', () => {
  const all = getAllQuestions();
  const kzceleb = all.filter((q) => q.topic === 'Kazakh Celebrities');
  assert.equal(kzceleb.length, 100);
  assert.ok(getTopics().includes('Kazakh Celebrities'));
});

test('World Economics category is present with 100 questions', () => {
  const all = getAllQuestions();
  const worldecon = all.filter((q) => q.topic === 'World Economics');
  assert.equal(worldecon.length, 100);
  assert.ok(getTopics().includes('World Economics'));
});

test('getRandomQuestions respects a topic filter', () => {
  const picked = getRandomQuestions(10, ['TV Shows']);
  assert.equal(picked.length, 10);
  assert.ok(picked.every((q) => q.topic === 'TV Shows'));
});

test('every question fits the fixed-size answer button length limits', () => {
  const all = getAllQuestions();
  for (const q of all) {
    assert.ok(q.question.length <= 110, `${q.id} question too long (${q.question.length})`);
    for (const opt of q.options) {
      assert.ok(opt.length <= 50, `${q.id} option too long (${opt.length}): ${opt}`);
    }
  }
});
