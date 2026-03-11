/**
 * Vote display console - shows live vote counts for each player including SKIP.
 * Launched automatically when the server starts. Clears and resets when each round ends.
 */
const http = require('http');
const readline = require('readline');

const PORT = process.env.PORT || 3000;
const BASE = `http://localhost:${PORT}`;
const POLL_INTERVAL = 1000;

let lastRound = null;
let players = [];

function fetch(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(null); }
      });
    }).on('error', reject);
  });
}

function render(votes, round) {
  lastRound = round;

  // Build display: SKIP first, then all players with vote counts
  const lines = [];
  lines.push('');
  lines.push('  ═══ AMONG US VOTE DISPLAY ═══');
  lines.push(`  Round ${round}`);
  lines.push('');

  const RED = '\x1b[31m';
  const RESET = '\x1b[0m';

  const skipCount = votes['SKIP'] || 0;
  lines.push(`  SKIP`.padEnd(24) + `${skipCount}`.padStart(4) + ' votes');
  lines.push('  ─────────────────────────────');

  // Find player(s) with most votes (only if max >= 1)
  let maxVotes = 0;
  let leaders = [];
  for (const p of players) {
    const name = typeof p === 'object' ? p.name : p;
    const count = votes[name] || 0;
    if (count > maxVotes) { maxVotes = count; leaders = [name]; }
    else if (count === maxVotes && count > 0) leaders.push(name);
  }
  const shouldHighlight = maxVotes >= 1;

  for (const p of players) {
    const name = typeof p === 'object' ? p.name : p;
    const count = votes[name] || 0;
    const line = `  ${name}`.padEnd(24) + `${count}`.padStart(4) + ' votes';
    lines.push(shouldHighlight && leaders.includes(name) ? RED + line + RESET : line);
  }

  lines.push('');
  lines.push('  (Updates every second. Close this window anytime.)');
  lines.push('');

  // Use readline for reliable cross-platform screen clear (works in Windows cmd)
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
  process.stdout.write(lines.join('\n'));
}

async function poll() {
  try {
    const [playersRes, votesRes, roundRes] = await Promise.all([
      fetch('/players'),
      fetch('/votes'),
      fetch('/round')
    ]);

    if (Array.isArray(playersRes) && playersRes.length > 0) {
      players = playersRes;
    }

    const votes = votesRes || {};
    const round = (roundRes && roundRes.round != null) ? roundRes.round : 1;
    render(votes, round);
  } catch (err) {
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
    process.stdout.write('\n  Waiting for server... (make sure server is running on port ' + PORT + ')\n\n');
  }
}

// Initial poll and then interval
poll();
setInterval(poll, POLL_INTERVAL);
