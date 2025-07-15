const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'start';
let score = 0;
let highScore = localStorage.getItem('doodleJumpHighScore') || 0;
let cameraY = 0;

const doodle = {
  x: canvas.width / 2 - 15,
  y: canvas.height - 150,
  width: 30,
  height: 30,
  velocityX: 0,
  velocityY: 0,
  speed: 5,
  jumpPower: 15,
  color: '#FFD700'
};

let platforms = [];
const platformWidth = 70;
const platformHeight = 15;

const gravity = 0.6;
const keys = {};

function init() {
  updateHighScoreDisplay();
  generateInitialPlatforms();
  gameLoop();
  
  document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    
    if (e.code === 'Space') {
      e.preventDefault();
      if (gameState === 'start') {
        startGame();
      } else if (gameState === 'gameOver') {
        restartGame();
      }
    }
  });
  
  document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });
  
  
  canvas.addEventListener('click', (e) => {
    if (gameState === 'start') {
      startGame();
    } else if (gameState === 'gameOver') {
      restartGame();
    }
  });
}

function generateInitialPlatforms() {
  platforms = [];
  
  
  platforms.push({
    x: canvas.width / 2 - platformWidth / 2,
    y: canvas.height - 100,
    type: 'normal'
  });
  
  
  for (let i = 1; i < 15; i++) {
    platforms.push({
      x: Math.random() * (canvas.width - platformWidth),
      y: canvas.height - 100 - (i * 80),
      type: Math.random() < 0.1 ? 'moving' : 'normal',
      direction: Math.random() < 0.5 ? -1 : 1,
      speed: 1 + Math.random()
    });
  }
}

function generateNewPlatforms() {
  const topPlatform = platforms[platforms.length - 1];
  const newY = topPlatform.y - 80;
  
  platforms.push({
    x: Math.random() * (canvas.width - platformWidth),
    y: newY,
    type: Math.random() < 0.15 ? 'moving' : 'normal',
    direction: Math.random() < 0.5 ? -1 : 1,
    speed: 1 + Math.random() * 2
  });
}

function startGame() {
  gameState = 'playing';
  score = 0;
  cameraY = 0;
  doodle.x = canvas.width / 2 - 15;
  doodle.y = canvas.height - 150;
  doodle.velocityX = 0;
  doodle.velocityY = 0;
  generateInitialPlatforms();
  document.getElementById('startScreen').style.display = 'none';
}

function restartGame() {
  gameState = 'playing';
  score = 0;
  cameraY = 0;
  doodle.x = canvas.width / 2 - 15;
  doodle.y = canvas.height - 150;
  doodle.velocityX = 0;
  doodle.velocityY = 0;
  generateInitialPlatforms();
  document.getElementById('gameOver').style.display = 'none';
}

function handleInput() {
  if (gameState !== 'playing') return;
  
  doodle.velocityX = 0;
  
  if (keys['a'] || keys['arrowleft']) {
    doodle.velocityX = -doodle.speed;
  }
  if (keys['d'] || keys['arrowright']) {
    doodle.velocityX = doodle.speed;
  }
}

function updateGame() {
  if (gameState !== 'playing') return;
  
  handleInput();
  
  
  doodle.x += doodle.velocityX;
  doodle.velocityY += gravity;
  doodle.y += doodle.velocityY;
  
  
  if (doodle.x < -doodle.width) {
    doodle.x = canvas.width;
  } else if (doodle.x > canvas.width) {
    doodle.x = -doodle.width;
  }
  
  
  if (doodle.y < canvas.height / 2 + cameraY) {
    cameraY = doodle.y - canvas.height / 2;
    score = Math.max(score, Math.floor(-cameraY / 10));
    updateScore();
  }
  
  
  platforms.forEach(platform => {
    if (platform.type === 'moving') {
      platform.x += platform.direction * platform.speed;
      if (platform.x <= 0 || platform.x >= canvas.width - platformWidth) {
        platform.direction *= -1;
      }
    }
  });
  
  
  while (platforms.length < 20) {
    generateNewPlatforms();
  }
  
  
  platforms = platforms.filter(platform => platform.y < doodle.y + canvas.height);
  
  
  checkPlatformCollisions();
  
  
  if (doodle.y > cameraY + canvas.height + 100) {
    gameOver();
  }
}

function checkPlatformCollisions() {
  if (doodle.velocityY > 0) { 
    platforms.forEach(platform => {
      if (doodle.x < platform.x + platformWidth &&
          doodle.x + doodle.width > platform.x &&
          doodle.y + doodle.height > platform.y &&
          doodle.y + doodle.height < platform.y + platformHeight + 10) {
        doodle.velocityY = -doodle.jumpPower;
      }
    });
  }
}

function gameOver() {
  gameState = 'gameOver';
  
  // Update high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('doodleJumpHighScore', highScore);
  }
  
  // Update UI
  document.getElementById('finalScore').textContent = score;
  document.getElementById('finalHighScore').textContent = highScore;
  
  // Show game over screen
  document.getElementById('gameOver').style.display = 'block';
}

function drawGame() {
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  
  ctx.save();
  ctx.translate(0, -cameraY);
  
  
  const gradient = ctx.createLinearGradient(0, cameraY, 0, cameraY + canvas.height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(0.5, '#B0E0E6');
  gradient.addColorStop(1, '#87CEEB');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, cameraY, canvas.width, canvas.height);
  
  
  platforms.forEach(platform => {
    if (platform.y > cameraY - 50 && platform.y < cameraY + canvas.height + 50) {
      
      if (platform.type === 'moving') {
        ctx.fillStyle = '#FF69B4';
      } else {
        ctx.fillStyle = '#32CD32';
      }
      
      
      ctx.fillRect(platform.x, platform.y, platformWidth, platformHeight);
      
      
      ctx.strokeStyle = '#228B22';
      ctx.lineWidth = 2;
      ctx.strokeRect(platform.x, platform.y, platformWidth, platformHeight);
    }
  });
  
  
  ctx.fillStyle = doodle.color;
  ctx.fillRect(doodle.x, doodle.y, doodle.width, doodle.height);
  
  
  ctx.fillStyle = 'black';
  ctx.fillRect(doodle.x + 8, doodle.y + 8, 3, 3); 
  ctx.fillRect(doodle.x + 19, doodle.y + 8, 3, 3); 
  
  
  ctx.beginPath();
  ctx.arc(doodle.x + 15, doodle.y + 20, 5, 0, Math.PI);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'black';
  ctx.stroke();
  
  
  ctx.restore();
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
