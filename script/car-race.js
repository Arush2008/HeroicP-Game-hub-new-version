const gameArea = document.querySelector('.game-area');
const player1 = document.querySelector('.car.player1');
const player2 = document.querySelector('.car.player2');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOver');
const finalPositionSpan = document.getElementById('finalPosition');
const modeSelect = document.getElementById('mode');
const controlsText = document.getElementById('controls-text');
const player2Controls = document.getElementById('player2-controls');
const soloInfo = document.getElementById('solo-info');
const gameContainer = document.querySelector('.game-container');
const roadLines = document.getElementById('roadLines');

// --- SOLO SCOREBOARD ELEMENTS ---
const soloScoreBoard = document.getElementById('solo-scoreboard');
const soloScoreSpan = document.getElementById('soloScore');
const soloHighScoreBoard = document.getElementById('solo-highscore');
const soloHighScoreSpan = document.getElementById('soloHighScore');

let soloScore = 0;
let soloHighScore = Number(localStorage.getItem('carRaceSoloHighScore') || 0);
let soloScoreInterval;

const areaWidth = 600;
const areaHeight = 600;
const carWidth = 50;
const carHeight = 80;

let laneCount = 6;
let laneWidth = areaWidth / laneCount;
let player1Lanes = [0, 1, 2];
let player2Lanes = [3, 4, 5];

let player1Lane = 1;
let player2Lane = 4;
let isPlaying = false;
let startTime, elapsedTime = 0, timerInterval;
let obstacles = [];
const obstacleSpeed = 12; // Always constant, never changes!
let animationId;
let roadOffset = 0;
let roadAnimationId = null;

let extraObstaclesInterval;
let maxObstaclesPerSide = 5; // You can adjust this for difficulty

// --- MODE RESTORE ON LOAD ---
if (localStorage.getItem('carRaceMode')) {
  modeSelect.value = localStorage.getItem('carRaceMode');
}
let gameMode = modeSelect.value; // "2p" or "solo"

// --- MODE SWITCHING LOGIC ---
function updateModeUI() {
  gameMode = modeSelect.value;
  if (gameMode === "solo") {
    gameContainer.classList.add("solo-mode");
    laneCount = 3;
    laneWidth = areaWidth / laneCount;
    player1Lanes = [0, 1, 2];
    player2Lanes = [];
    player1Lane = 1;
    player2Lane = 1; // Not used
    controlsText.textContent = "Controls: Player 1 - A/D or ←/→ | SPACE or Click to start/restart";
    player2Controls.style.display = "none";
    soloInfo.style.display = "block";
    updateLaneLinesForSolo();
    soloScoreBoard.style.display = "block";
    soloHighScoreBoard.style.display = "block";
    soloHighScoreSpan.textContent = soloHighScore;
  } else {
    gameContainer.classList.remove("solo-mode");
    laneCount = 6;
    laneWidth = areaWidth / laneCount;
    player1Lanes = [0, 1, 2];
    player2Lanes = [3, 4, 5];
    player1Lane = 1;
    player2Lane = 4;
    controlsText.textContent = "Controls: Player 1 - A/D | Player 2 - ←/→ | SPACE or Click to start/restart";
    player2Controls.style.display = "";
    soloInfo.style.display = "none";
    updateLaneLinesFor2P();
    soloScoreBoard.style.display = "none";
    soloHighScoreBoard.style.display = "none";
  }
  setCarPositions();
  createObstacles();
}

modeSelect.addEventListener("change", () => {
  updateModeUI();
  showStartScreen();
});

// --- LANE LINES SWITCHING ---
function updateLaneLinesForSolo() {
  const lines = roadLines.querySelectorAll('.lane-line');
  lines[0].style.display = "block";
  lines[1].style.display = "block";
  lines[2].style.display = "none";
  lines[3].style.display = "none";
  lines[0].style.left = "33.33%";
  lines[1].style.left = "66.66%";
  roadLines.querySelector('.middle-border').style.display = "none";
}
function updateLaneLinesFor2P() {
  const lines = roadLines.querySelectorAll('.lane-line');
  lines[0].style.display = "block";
  lines[1].style.display = "block";
  lines[2].style.display = "block";
  lines[3].style.display = "block";
  lines[0].style.left = "16.66%";
  lines[1].style.left = "33.33%";
  lines[2].style.left = "66.66%";
  lines[3].style.left = "83.33%";
  roadLines.querySelector('.middle-border').style.display = "block";
}

// --- SOLO SCORE LOGIC ---
function startSoloScore() {
  soloScore = 0;
  soloScoreSpan.textContent = soloScore;
  soloHighScoreSpan.textContent = soloHighScore;
  clearInterval(soloScoreInterval);
  soloScoreInterval = setInterval(() => {
    if (isPlaying && gameMode === "solo") {
      soloScore++;
      soloScoreSpan.textContent = soloScore;
    }
  }, 1000);
}
function stopSoloScore() {
  clearInterval(soloScoreInterval);
  if (gameMode === "solo" && soloScore > soloHighScore) {
    soloHighScore = soloScore;
    localStorage.setItem('carRaceSoloHighScore', soloHighScore);
    soloHighScoreSpan.textContent = soloHighScore;
  }
}

// --- GAME LOGIC ---
function getLaneX(lane) {
  return lane * laneWidth + laneWidth / 2 - carWidth / 2;
}

function setCarPositions() {
  player1.style.left = getLaneX(player1Lane) + 'px';
  player1.style.bottom = '40px';
  if (gameMode === "2p") {
    player2.style.left = getLaneX(player2Lane) + 'px';
    player2.style.bottom = '40px';
    player2.style.display = "";
  } else {
    player2.style.display = "none";
  }
}

function createObstacles() {
  obstacles.forEach(obs => obs.el.remove());
  obstacles = [];
  addObstacleForSide(1);
  if (gameMode === "2p") addObstacleForSide(2);
}

function addObstacleForSide(side) {
  let lanes = side === 1 ? player1Lanes : player2Lanes;
  if (!lanes.length) return;

  // --- SOLO MODE: Prevent all 3 lanes blocked at once ---
  if (gameMode === "solo" && side === 1) {
    // Find y positions of existing obstacles
    const yPositions = obstacles
      .filter(o => o.side === 1)
      .map(o => ({ lane: o.lane, y: o.y }));

    // Try to find a lane and y that won't block all 3 at the same y-range
    let tries = 0;
    let lane, y;
    while (tries < 10) {
      lane = lanes[Math.floor(Math.random() * lanes.length)];
      y = -Math.random() * 600;

      // Find obstacles close to this y (within 120px vertically)
      const closeObstacles = yPositions.filter(
        o => Math.abs(o.y - y) < 120
      );
      // Get lanes occupied at this y-range
      const lanesAtY = closeObstacles.map(o => o.lane);

      // If placing this obstacle would block all 3 lanes at this y, try again
      if (lanesAtY.length < 2 || !lanesAtY.includes(lane)) {
        break;
      }
      tries++;
    }
    // If after 10 tries, just place it (should be rare)
    let obs = document.createElement('div');
    obs.className = 'obstacle ' + randomColor();
    obs.lane = lane;
    obs.style.left = getLaneX(obs.lane) + 'px';
    obs.y = y;
    obs.style.top = obs.y + 'px';
    gameArea.appendChild(obs);
    obstacles.push({el: obs, lane: obs.lane, y: obs.y, side});
    return;
  }

  // --- 2P mode or player2 side: normal spawn ---
  let obs = document.createElement('div');
  obs.className = 'obstacle ' + randomColor();
  obs.lane = lanes[Math.floor(Math.random() * lanes.length)];
  obs.style.left = getLaneX(obs.lane) + 'px';
  obs.y = -Math.random() * 600;
  obs.style.top = obs.y + 'px';
  gameArea.appendChild(obs);
  obstacles.push({el: obs, lane: obs.lane, y: obs.y, side});
}

function addExtraObstacles() {
  let side1 = obstacles.filter(o => o.side === 1).length;
  let side2 = obstacles.filter(o => o.side === 2).length;
  if (side1 < maxObstaclesPerSide) addObstacleForSide(1);
  if (gameMode === "2p" && side2 < maxObstaclesPerSide) addObstacleForSide(2);
}

function startExtraObstacles() {
  clearInterval(extraObstaclesInterval);
  extraObstaclesInterval = setInterval(() => {
    if (isPlaying) addExtraObstacles();
  }, 10000);
}
function stopExtraObstacles() {
  clearInterval(extraObstaclesInterval);
}

function randomColor() {
  const colors = ['blue', 'green', 'orange'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function moveObstacles() {
  for (let obs of obstacles) {
    obs.y += obstacleSpeed;
    if (obs.y > areaHeight) {
      if (obs.side === 1) {
        obs.lane = player1Lanes[Math.floor(Math.random() * player1Lanes.length)];
      } else if (gameMode === "2p") {
        obs.lane = player2Lanes[Math.floor(Math.random() * player2Lanes.length)];
      }
      obs.el.className = 'obstacle ' + randomColor();
      obs.y = -carHeight - Math.random() * 200;
      obs.el.style.left = getLaneX(obs.lane) + 'px';
    }
    obs.el.style.top = obs.y + 'px';
  }
}

function rectsOverlap(r1, r2) {
  return !(
    r1.right < r2.left ||
    r1.left > r2.right ||
    r1.bottom < r2.top ||
    r1.top > r2.bottom
  );
}

function checkCollision() {
  for (let obs of obstacles) {
    const obsRect = obs.el.getBoundingClientRect();
    const p1Rect = player1.getBoundingClientRect();
    if (
      obs.side === 1 &&
      obs.lane === player1Lane &&
      rectsOverlap(p1Rect, obsRect)
    ) {
      return 'Player 1';
    }
    if (gameMode === "2p") {
      const p2Rect = player2.getBoundingClientRect();
      if (
        obs.side === 2 &&
        obs.lane === player2Lane &&
        rectsOverlap(p2Rect, obsRect)
      ) {
        return 'Player 2';
      }
    }
  }
  return null;
}

function animateRoad() {
  roadOffset += 8;
  document.querySelectorAll('.lane-line').forEach(line => {
    line.style.backgroundPositionY = roadOffset + 'px';
  });
  if (isPlaying) {
    roadAnimationId = requestAnimationFrame(animateRoad);
  }
}

// --- TIMER: Update all lapTime spans ---
function updateLapTimeSpans(val) {
  document.querySelectorAll('#lapTime').forEach(span => {
    span.textContent = val;
  });
}

function startTimer() {
  clearInterval(timerInterval);
  startTime = Date.now();
  timerInterval = setInterval(() => {
    elapsedTime = (Date.now() - startTime) / 1000;
    updateLapTimeSpans(elapsedTime.toFixed(2) + "s");
  }, 50);
}
function stopTimer() {
  clearInterval(timerInterval);
}

function gameLoop() {
  if (!isPlaying) return;
  moveObstacles();
  setCarPositions();
  let loser = checkCollision();
  if (loser) {
    endGame(loser);
    return;
  }
  animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
  startScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';
  isPlaying = true;
  if (gameMode === "solo") {
    player1Lane = 1;
    startSoloScore();
  } else {
    player1Lane = 1;
    player2Lane = 4;
    stopSoloScore();
  }
  setCarPositions();
  createObstacles();
  elapsedTime = 0;
  updateLapTimeSpans("0.00s");
  startTimer();
  animationId = requestAnimationFrame(gameLoop);
  roadAnimationId = requestAnimationFrame(animateRoad);
  startExtraObstacles();
}

function endGame(loser) {
  isPlaying = false;
  cancelAnimationFrame(animationId);
  cancelAnimationFrame(roadAnimationId);
  stopTimer();
  stopExtraObstacles();
  stopSoloScore();
  updateLapTimeSpans(elapsedTime.toFixed(2) + "s");
  finalPositionSpan.textContent = loser + " crashed!";
  gameOverScreen.style.display = 'block';
}

function showStartScreen() {
  startScreen.style.display = 'block';
  gameOverScreen.style.display = 'none';
}

// --- KEYBOARD CONTROLS ---
window.addEventListener('keydown', (e) => {
  if (!isPlaying) {
    if (e.code === 'Space') {
      localStorage.setItem('carRaceMode', modeSelect.value);
      localStorage.setItem('carRaceAutoStart', 'true');
      window.location.reload();
    }
    return;
  }
  // Player 1 controls (A/D always, Arrow keys only in solo mode)
  if (
    (e.key === 'a' || e.key === 'A') &&
    player1Lane > 0 &&
    player1Lanes.includes(player1Lane - 1)
  ) {
    player1Lane--;
  }
  if (
    (e.key === 'd' || e.key === 'D') &&
    player1Lane < player1Lanes[player1Lanes.length - 1] &&
    player1Lanes.includes(player1Lane + 1)
  ) {
    player1Lane++;
  }
  // Arrow keys for player 1 ONLY in solo mode
  if (gameMode === 'solo') {
    if (
      e.key === 'ArrowLeft' &&
      player1Lane > 0 &&
      player1Lanes.includes(player1Lane - 1)
    ) {
      player1Lane--;
    }
    if (
      e.key === 'ArrowRight' &&
      player1Lane < player1Lanes[player1Lanes.length - 1] &&
      player1Lanes.includes(player1Lane + 1)
    ) {
      player1Lane++;
    }
  }
  // Player 2 controls (Arrow keys only in 2p mode)
  if (gameMode === '2p') {
    if (
      e.key === 'ArrowLeft' &&
      player2Lane > player2Lanes[0] &&
      player2Lanes.includes(player2Lane - 1)
    ) {
      player2Lane--;
    }
    if (
      e.key === 'ArrowRight' &&
      player2Lane < player2Lanes[player2Lanes.length - 1] &&
      player2Lanes.includes(player2Lane + 1)
    ) {
      player2Lane++;
    }
  }
  setCarPositions();
});

// Click to start/restart
startScreen.addEventListener('click', () => restartGame());
gameOverScreen.addEventListener('click', () => restartGame());

function goHome() {
  window.location.href = 'index.html';
}
function restartGame() {
  // Save mode and set auto-start flag, then reload
  localStorage.setItem('carRaceMode', modeSelect.value);
  localStorage.setItem('carRaceAutoStart', 'true');
  window.location.reload();
}

// --- INITIAL SETUP ---
updateModeUI();
setCarPositions();
createObstacles();
updateLapTimeSpans("0.00s");

// Auto-start game if coming from "Race Again" or SPACE
if (localStorage.getItem('carRaceAutoStart') === 'true') {
  localStorage.removeItem('carRaceAutoStart');
  setTimeout(() => {
    startGame();
  }, 100); // slight delay to ensure DOM is ready
}