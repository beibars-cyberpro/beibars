const fs = require('fs');
const path = require('path');

const QUESTIONS_DIR = path.join(__dirname, '..', '..', 'questions');

const TOPIC_FILES = [
  'quantitative-methods.json',
  'economics.json',
  'financial-statement-analysis.json',
  'corporate-issuers.json',
  'equity-investments.json',
  'fixed-income.json',
  'derivatives.json',
  'alternative-investments.json',
  'portfolio-management.json',
  'ethics.json',
  'macro-central-banks.json',
];

function loadAllQuestions() {
  const all = [];
  const seenIds = new Set();

  for (const file of TOPIC_FILES) {
    const fullPath = path.join(QUESTIONS_DIR, file);
    if (!fs.existsSync(fullPath)) continue;

    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    } catch (err) {
      console.error(`[questions] failed to parse ${file}: ${err.message}`);
      continue;
    }

    if (!Array.isArray(parsed)) {
      console.error(`[questions] ${file} is not a JSON array, skipping`);
      continue;
    }

    for (const q of parsed) {
      const problems = validateQuestion(q);
      if (problems.length) {
        console.error(`[questions] skipping invalid question ${q && q.id} in ${file}: ${problems.join(', ')}`);
        continue;
      }
      if (seenIds.has(q.id)) {
        console.error(`[questions] duplicate id ${q.id} in ${file}, skipping`);
        continue;
      }
      seenIds.add(q.id);
      all.push(q);
    }
  }

  return all;
}

function validateQuestion(q) {
  const problems = [];
  if (!q || typeof q !== 'object') return ['not an object'];
  if (typeof q.id !== 'string' || !q.id) problems.push('missing id');
  if (typeof q.topic !== 'string' || !q.topic) problems.push('missing topic');
  if (typeof q.question !== 'string' || !q.question) problems.push('missing question text');
  if (!Array.isArray(q.options) || q.options.length !== 4) problems.push('options must be an array of 4');
  if (
    typeof q.correctIndex !== 'number' ||
    !Number.isInteger(q.correctIndex) ||
    q.correctIndex < 0 ||
    q.correctIndex > 3
  ) {
    problems.push('correctIndex must be an integer 0-3');
  }
  return problems;
}

let cache = null;

function getAllQuestions() {
  if (!cache) cache = loadAllQuestions();
  return cache;
}

function getTopics() {
  const topics = new Set();
  for (const q of getAllQuestions()) topics.add(q.topic);
  return [...topics].sort();
}

function shuffle(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Picks `count` random questions, optionally filtered to a set of topics.
// Falls back to the full bank if the filtered set doesn't have enough questions.
function getRandomQuestions(count, topics) {
  const bank = getAllQuestions();
  let pool = bank;
  if (Array.isArray(topics) && topics.length > 0) {
    const filtered = bank.filter((q) => topics.includes(q.topic));
    if (filtered.length >= count) pool = filtered;
  }
  return shuffle(pool).slice(0, count);
}

module.exports = { getAllQuestions, getTopics, getRandomQuestions };
