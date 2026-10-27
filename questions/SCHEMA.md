# Question bank schema

Each topic file is a JSON array of question objects with this exact shape:

```json
{
  "id": "der-001",
  "topic": "Derivatives",
  "subtopic": "Option Strategies",
  "difficulty": "medium",
  "question": "Why would an investor holding a long stock position buy a protective put?",
  "options": [
    "To generate additional income from option premiums",
    "To hedge downside risk while retaining upside potential",
    "To increase leverage on the existing position",
    "To lock in the stock's current dividend yield"
  ],
  "correctIndex": 1,
  "explanation": "A protective put works like insurance: it caps downside losses at the strike price while the investor keeps full upside participation, at the cost of the premium paid."
}
```

Rules:
- `difficulty` is one of `"easy"`, `"medium"`, `"hard"`.
- `options` always has exactly 4 entries.
- `correctIndex` is 0-based.
- `explanation` is 1-3 sentences, written so a quiz player learns something after seeing the answer.

### Content rules by category

**Finance/CFA/macro topics** (Quantitative Methods, Economics, Financial Statement Analysis, Corporate Issuers, Equity Investments, Fixed Income, Derivatives, Alternative Investments, Portfolio Management, Ethics, Macro & Central Banks):
- Conceptual/qualitative only — no arithmetic, no formulas, no "calculate the value of...". They test *why*/*what*/*when* understanding.
- Original writing inspired by CFA Level 2 curriculum topic areas and macro/central-bank policy — never copy real exam questions verbatim, and never copy text from CFA Institute curriculum PDFs even if referenced as background material.

**Entertainment/trivia topics** (e.g. TV Shows):
- Original trivia questions testing factual knowledge of the show (characters, running gags, plot events) — never reproduce copyrighted script dialogue verbatim (a one-word catchphrase is fine).
- Only include facts that are well-established and widely known from the show (recurring across multiple episodes/seasons) rather than ultra-specific single-episode minutiae that's easy to misremember — favor being correct over being obscure.

### Length limits (must fit fixed-size buttons on a phone screen)

- `question`: **110 characters max**, ideally 60-100. One short, direct sentence.
- each entry in `options`: **50 characters max**, ideally 20-40. A short phrase, not a full sentence — no sub-clauses, no "because..." explanations (those belong in `explanation`).
- `explanation`: 1-2 short sentences, up to ~220 characters.
