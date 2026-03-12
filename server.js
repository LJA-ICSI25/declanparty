const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

/* ---------- GAME STATE ---------- */

let votes = {};
let round = 1;
let ejected = {};
let killed = {};

const COLOR_OVERRIDES = {
  "Julian": "linear-gradient(90deg, #111111 0%, red 12%, orange 28%, yellow 44%, green 60%, blue 76%, purple 88%, #111111 100%)",
  "Brayden": "#8B5CF6",
  "Maytte": "#FFC0CB",
  "Declan": "#000080",
  "Lunden": "#800080",
  "Ava p": "#C0708A"
};

let players = [
  { name: "Tori", color: "#6366F1" },
  { name: "Emmy", color: "#132FD2" },
  { name: "Julian", color: COLOR_OVERRIDES["Julian"] },
  { name: "Brayden", color: COLOR_OVERRIDES["Brayden"] },
  { name: "Addy", color: "#EA580C" },
  { name: "krysthel", color: "#6B2FBC" },
  { name: "Margaret", color: "#71491E" },
  { name: "Sevastian", color: "#0D9488" },
  { name: "Thalia", color: "#EC0E63" },
  { name: "Carina", color: "#7C3AED" },
  { name: "Maytte", color: COLOR_OVERRIDES["Maytte"] },
  { name: "Dilyah", color: "#16A34A" },
  { name: "Ava u", color: "#E55B8C" },
  { name: "Soleil", color: "#D97706" },
  { name: "Ava p", color: COLOR_OVERRIDES["Ava p"] },
  { name: "Elijah", color: "#0891B2" },
  { name: "Lisa", color: "#059669" },
  { name: "Harry", color: "#B45309" },
  { name: "Isla", color: "#C51111" },
  { name: "Declan", color: COLOR_OVERRIDES["Declan"] },
  { name: "Lunden", color: COLOR_OVERRIDES["Lunden"] }
];

/* ---------- ROUTES ---------- */

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/players', (req, res) => {
  res.json(players);
});

app.post('/players', (req, res) => {
  const list = req.body.players;
  if (Array.isArray(list) && list.length > 0) {
    players = list;
  }
  res.json(players);
});

app.post('/vote', (req, res) => {
  const name = req.body.name;
  if (!name) return res.json(votes);
  if (votes[name] === undefined) votes[name] = 0;
  votes[name]++;
  res.json(votes);
});

app.get('/votes', (req, res) => res.json(votes));
app.get('/round', (req, res) => res.json({ round }));
app.get('/ejected', (req, res) => res.json(ejected));
app.get('/killed', (req, res) => res.json(killed));

app.post('/reset', (req, res) => {
  let max = 0;
  let leaders = [];
  const skipVotes = votes['SKIP'] || 0;

  for (let p in votes) {
    if (p === 'SKIP') continue;
    if (votes[p] > max) {
      max = votes[p];
      leaders = [p];
    } else if (votes[p] === max && max > 0) {
      leaders.push(p);
    }
  }
  const skipWins = skipVotes > max && skipVotes > 0;

  let lastEjected = null;
  if (!skipWins && max > 0 && leaders.length === 1 && leaders[0] !== 'SKIP') {
    lastEjected = leaders[0];
    ejected[lastEjected] = true;
  }

  for (let p in votes) votes[p] = 0;
  round++;
  res.json({ votes, round, ejected, lastEjected, skipped: skipWins });
});

app.post('/kill', (req, res) => {
  const name = req.body.name;
  if (!name) return res.json({ round, ejected, killed, lastEjected: null });
  if (votes[name] === undefined) votes[name] = 0;
  ejected[name] = true;
  killed[name] = true;
  round++;
  for (let p in votes) votes[p] = 0;
  res.json({ round, ejected, killed, lastEjected: name });
});

app.post('/full-reset', (req, res) => {
  votes = {};
  ejected = {};
  killed = {};
  round = 1;
  res.json({ votes, ejected, killed, round });
});

/* ---------- START SERVER ---------- */

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  const url = `http://localhost:${PORT}/vote-display.html`;
  const isWin = process.platform === 'win32';
  if (isWin) {
    spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' });
  } else {
    const opener = process.platform === 'darwin' ? 'open' : 'xdg-open';
    spawn(opener, [url], { detached: true, stdio: 'ignore' });
  }
});
