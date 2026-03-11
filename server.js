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
let players = [
  {name:"Tori",color:"#C51111"},
  {name:"Emmy",color:"#132FD2"},
  {name:"Julian",color:"#117F2D"},
  {name:"Brayden",color:"#D4A017"},
  {name:"Addy",color:"#EA580C"},
  {name:"krysthel",color:"#6B2FBC"},
  {name:"Margaret",color:"#71491E"},
  {name:"Sevastian",color:"#0D9488"},
  {name:"Thalia",color:"#EC0E63"},
  {name:"Carina",color:"#7C3AED"},
  {name:"Maytte",color:"#0EA5E9"},
  {name:"Dilyah",color:"#16A34A"},
  {name:"Ava u",color:"#E55B8C"},
  {name:"Soleil",color:"#D97706"},
  {name:"Ava p",color:"#8B5CF6"},
  {name:"Elijah",color:"#0891B2"},
  {name:"Azzy",color:"#DB2777"},
  {name:"Lisa",color:"#059669"},
  {name:"Harry",color:"#B45309"},
  {name:"Isla",color:"#6366F1"},
  {name:"Declan",color:"#65A30D"},
  {name:"Lunden",color:"#BE185D"},
  {name:"Arion",color:"#0F766E"}
];

/* ---------- PAGE ---------- */
app.get('/', (req,res)=>{
  res.sendFile(path.join(__dirname,'index.html'));
});

/* ---------- PLAYERS ---------- */
app.get('/players',(req,res)=>{
  res.json(players);
});
app.post('/players',(req,res)=>{
  const list = req.body.players;
  if (Array.isArray(list) && list.length > 0) {
    players = list;
  }
  res.json(players);
});

/* ---------- VOTING ---------- */
app.post('/vote',(req,res)=>{
  const name = req.body.name;
  if (!name) return res.json(votes);
  if (votes[name] === undefined) votes[name] = 0;
  votes[name]++;
  res.json(votes);
});

app.get('/votes',(req,res)=> res.json(votes));
app.get('/round',(req,res)=> res.json({round}));
app.get('/ejected',(req,res)=> res.json(ejected));
app.get('/killed',(req,res)=> res.json(killed));

/* ---------- END MEETING / RESET ---------- */
app.post('/reset',(req,res)=>{
  let max = 0;
  let leaders = [];
  const skipVotes = votes['SKIP'] || 0;
  for(let p in votes){
    if(p === 'SKIP') continue;
    if(votes[p] > max){ max = votes[p]; leaders = [p]; }
    else if(votes[p] === max && max > 0) leaders.push(p);
  }
  const skipWins = skipVotes > max && skipVotes > 0;

  let lastEjected = null;
  if(!skipWins && max > 0 && leaders.length === 1 && leaders[0] !== 'SKIP'){
    lastEjected = leaders[0];
    ejected[lastEjected] = true;
  }

  for(let p in votes) votes[p] = 0;
  round++;
  res.json({votes, round, ejected, lastEjected, skipped: skipWins});
});

/* ---------- KILL (from index or admin) ---------- */
app.post('/kill',(req,res)=>{
  const name = req.body.name;
  if (!name) return res.json({round, ejected, killed, lastEjected: null});
  if (votes[name] === undefined) votes[name] = 0;
  ejected[name] = true;
  killed[name] = true;
  round++;
  for(let p in votes) votes[p] = 0;
  res.json({round, ejected, killed, lastEjected: name});
});

/* ---------- FULL RESET ---------- */
app.post('/full-reset',(req,res)=>{
  votes = {};
  ejected = {};
  killed = {};
  round = 1;
  res.json({votes, ejected, killed, round});
});

/* ---------- START SERVER ---------- */
app.listen(PORT,'0.0.0.0',()=>{
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
