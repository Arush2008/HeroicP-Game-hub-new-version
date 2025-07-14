
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'waiting';
let score = 0;
let highScore = localStorage.getItem('flappyBirdHighScore') || 0;
let gameSpeed = 2;
let gravity = 0.5;
let jumpPower = -9;
let gameStarted = false;

const bird = {
  x: 100,
  y: canvas.height / 2,
  width: 30,
  height: 30,
  velocity: 0,
  color: '#FFD700'
};

let pipes = [];
const pipeWidth = 60;
const pipeGap = 180;
const pipeSpacing = 300;

let clouds = [];
let frameCount = 0;


function init() {
  updateHighScoreDisplay();
  generateClouds();
  resetBird();
  gameLoop();
  
  document.addEventListener('keydown', handleInput);
  canvas.addEventListener('click', handleInput);
}

function resetBird() {
  bird.x = 100;
  bird.y = canvas.height / 2;
  bird.velocity = 0;
}

function generateClouds() {
  clouds = [];
  for (let i = 0; i < 5; i++) {
    clouds.push({
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height / 3),
      width: 60 + Math.random() * 40,
      height: 30 + Math.random() * 20,
      speed: 0.5 + Math.random() * 0.5
    });
  }
}

function handleInput(e) {
  if (e.type === 'keydown' && e.code !== 'Space') return;
  if (e.type === 'keydown') e.preventDefault();
  
  if (gameState === 'waiting') {
    startGame();
  } else if (gameState === 'playing') {
    if (!gameStarted) {
      gameStarted = true;
    }
    jump();
  } else if (gameState === 'gameOver') {
    restartGame();
  }
}

function jump() {
  bird.velocity = jumpPower;
}

function startGame() {
  gameState = 'playing';
  gameStarted = false;
  score = 0;
  pipes = [];
  resetBird();
  frameCount = 0;
  document.getElementById('startScreen').style.display = 'none';
}

function restartGame() {
  gameState = 'playing';
  gameStarted = false;
  score = 0;
  pipes = [];
  resetBird();
  frameCount = 0;
  document.getElementById('gameOver').style.display = 'none';
}

function addPipe() {
  const minGapY = 100;
  const maxGapY = canvas.height - 200;
  const gapY = minGapY + Math.random() * (maxGapY - minGapY);
  
  pipes.push({
    x: canvas.width,
    topHeight: gapY,
    bottomY: gapY + pipeGap,
    bottomHeight: canvas.height - (gapY + pipeGap),
    scored: false
  });
}

function updateGame() {
  frameCount++;
  
  if (gameState === 'waiting') {
    bird.y = canvas.height / 2 + Math.sin(frameCount * 0.1) * 5;
    bird.velocity = 0;
    return;
  }
  
  if (gameState !== 'playing') return;
  
  if (!gameStarted) {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    return;
  }
  
  bird.velocity += gravity;
  bird.y += bird.velocity;
  
  if (bird.y < 0) {
    bird.y = 0;
    bird.velocity = 0;
  }
  
  pipes.forEach((pipe, index) => {
    pipe.x -= gameSpeed;
    
    if (pipe.x + pipeWidth < 0) {
      pipes.splice(index, 1);
    }
    
    if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
      pipe.scored = true;
      score++;
      updateScore();
    }
  });
  
  if (gameStarted && frameCount % 120 === 0) {
    addPipe();
  }
  
  
  clouds.forEach(cloud => {
    cloud.x -= cloud.speed;
    if (cloud.x + cloud.width < 0) {
      cloud.x = canvas.width;
      cloud.y = Math.random() * (canvas.height / 3);
    }
  });
  
  
  checkCollisions();
}

function checkCollisions() {
  if (bird.y + bird.height >= canvas.height || bird.y <= 0) {
    gameOver();
    return;
  }
  
  pipes.forEach(pipe => {
    const birdLeft = bird.x;
    const birdRight = bird.x + bird.width;
    const birdTop = bird.y;
    const birdBottom = bird.y + bird.height;
    
    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + pipeWidth;
    
    if (birdRight > pipeLeft && birdLeft < pipeRight) {
      if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
        gameOver();
      }
    }
  });
}

function gameOver() {
  gameState = 'gameOver';
  
  
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('flappyBirdHighScore', highScore);
  }
  
  
  document.getElementById('finalScore').textContent = score;
  document.getElementById('finalHighScore').textContent = highScore;
  document.getElementById('gameOver').style.display = 'block';
}

function drawGame() {
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#98D8E8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  clouds.forEach(cloud => {
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.width / 4, 0, Math.PI * 2);
    ctx.arc(cloud.x + cloud.width / 3, cloud.y, cloud.width / 3, 0, Math.PI * 2);
    ctx.arc(cloud.x + cloud.width / 1.5, cloud.y, cloud.width / 4, 0, Math.PI * 2);
    ctx.fill();
  });
  
  
  ctx.fillStyle = '#228B22';
  pipes.forEach(pipe => {
    
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
    
    ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, pipe.bottomHeight);
    
    
    ctx.fillStyle = '#32CD32';
    ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, pipeWidth + 10, 30);
    ctx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 30);
    ctx.fillStyle = '#228B22';
  });
  
  
  ctx.fillStyle = bird.color;
  ctx.beginPath();
  ctx.arc(bird.x + bird.width/2, bird.y + bird.height/2, bird.width/2, 0, Math.PI * 2);
  ctx.fill();
  
  
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(bird.x + bird.width/2 + 5, bird.y + bird.height/2 - 5, 5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(bird.x + bird.width/2 + 7, bird.y + bird.height/2 - 5, 2, 0, Math.PI * 2);
  ctx.fill();
  
  
  ctx.fillStyle = '#FFA500';
  ctx.beginPath();
  ctx.moveTo(bird.x + bird.width, bird.y + bird.height/2);
  ctx.lineTo(bird.x + bird.width + 10, bird.y + bird.height/2 - 3);
  ctx.lineTo(bird.x + bird.width + 10, bird.y + bird.height/2 + 3);
  ctx.closePath();
  ctx.fill();
}

function updateScore() {
  document.getElementById('score').textContent = score;
}

function updateHighScoreDisplay() {
  document.getElementById('highScore').textContent = highScore;
}

function gameLoop() {
  updateGame();
  drawGame();
  requestAnimationFrame(gameLoop);
}

function goHome() {
  window.location.href = 'index.html';
}


document.addEventListener('DOMContentLoaded', init);
