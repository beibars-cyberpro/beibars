const test = require('node:test');
const assert = require('node:assert/strict');
const { getAllQuestions, getTopics, getRandomQuestions } = require('../questions');

test('loads the full question bank with no duplicate ids', () => {
  const all = getAllQuestions();
  assert.equal(all.length, 600);
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
