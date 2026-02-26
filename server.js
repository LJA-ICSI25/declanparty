const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

/* ---------- GAME STATE ---------- */
// votes: dynamic map of player name -> vote count
let votes = {};
let round = 1;       // tracks meeting number
let ejected = {};    // tracks who has been ejected


/* ---------- PAGE ---------- */
app.get('/', (req,res)=>{
  res.sendFile(path.join(__dirname,'index.html'));
});

/* ---------- VOTING ---------- */
app.post('/vote',(req,res)=>{
  const name = req.body.name;
  if (!name) return res.json(votes);

  if (votes[name] === undefined) {
    votes[name] = 0;
  }
  votes[name]++;
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
  if (!name) {
    return res.json({round, ejected, lastEjected: null});
  }

  // Mark this player as ejected even if they have never received votes before
  if (votes[name] === undefined) {
    votes[name] = 0;
  }
  ejected[name] = true;
  round++;
  for(let p in votes) votes[p] = 0;
  res.json({round, ejected, lastEjected: name});
});

/* ---------- START SERVER ---------- */
app.listen(PORT,'0.0.0.0',()=>{
  console.log(`Server running on port ${PORT}`);
});
