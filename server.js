const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

/* ---------- GAME STATE ---------- */
let votes = {
  RED:0, BLUE:0, GREEN:0, YELLOW:0, PINK:0, ORANGE:0
};
let round = 1;       // tracks meeting number
let ejected = {};    // tracks who has been ejected

/* ---------- PAGE ---------- */
app.get('/', (req,res)=>{
  res.sendFile(path.join(__dirname,'index.html'));
});

/* ---------- VOTING ---------- */
app.post('/vote',(req,res)=>{
  const name=req.body.name;
  if(votes[name]!==undefined){
    votes[name]++;
  }
  res.json(votes);
});

/* ---------- GET TOTALS ---------- */
app.get('/votes',(req,res)=>{
  res.json(votes);
});

/* ---------- ROUND CHECK ---------- */
app.get('/round',(req,res)=>{
  res.json({round});
});

/* ---------- EJECTED PLAYERS ---------- */
app.get('/ejected',(req,res)=>{
  res.json(ejected);
});

/* ---------- END MEETING / RESET ---------- */
app.post('/reset',(req,res)=>{
  let max = 0;
  let leaders = [];

  for(let p in votes){
    if(votes[p] > max){
      max = votes[p];
      leaders = [p];
    } else if(votes[p] === max && max > 0){
      leaders.push(p);
    }
  }

  let lastEjected = null;

  if(max > 0 && leaders.length === 1){
    lastEjected = leaders[0];
    ejected[lastEjected] = true;
  }

  for(let p in votes) votes[p] = 0;
  round++;

  res.json({votes, round, ejected, lastEjected});
});

/* ---------- HOST KILL / FORCE EJECT ---------- */
app.post('/kill',(req,res)=>{
  const name = req.body.name;
  if(votes[name] !== undefined){
    ejected[name] = true;
  }
  round++;
  for(let p in votes) votes[p] = 0;
  res.json({round, ejected, lastEjected: name});
});

/* ---------- START SERVER ---------- */
app.listen(PORT,'0.0.0.0',()=>{
  console.log(`Server running on port ${PORT}`);
});
