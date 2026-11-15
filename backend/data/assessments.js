const QUIZ = [
  {
    q: "Country-level cultural patterns are best treated as:",
    opts: [
      "Rules that apply to every person from that country",
      "Possible context to check with the individual",
      "A score to rank colleagues",
    ],
    a: 1,
  },
  {
    q: "A colleague gives very short written feedback. A good first step is to:",
    opts: [
      "Ask how they prefer to give and receive feedback",
      "Assume they are being rude",
      "Reply with equally short comments",
    ],
    a: 0,
  },
  {
    q: "For a weekly meeting across several time zones, the fairest approach is to:",
    opts: [
      "Always use head-office time",
      "Skip people in far time zones",
      "Rotate times and share a recording with notes",
    ],
    a: 2,
  },
  {
    q: "Psychological safety means:",
    opts: [
      "Nobody ever disagrees",
      "People can raise concerns without fear of embarrassment or punishment",
      "Only managers give feedback",
    ],
    a: 1,
  },
  {
    q: "You witness an exclusionary comment in a meeting. A good response is to:",
    opts: [
      "Ignore it",
      "Address it calmly, support the affected person and report if needed",
      "Publicly shame the colleague",
    ],
    a: 1,
  },
];

const SCENARIOS = [
  { id: "s1", correctOption: 1 },
  { id: "s2", correctOption: 1 },
  { id: "s3", correctOption: 0 },
  { id: "s4", correctOption: 1 },
  { id: "s5", correctOption: 1 },
];

module.exports = { QUIZ, SCENARIOS };