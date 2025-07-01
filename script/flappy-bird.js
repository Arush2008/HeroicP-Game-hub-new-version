
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


let gameState = 'start'; 
let score = 0;
let highScore = localStorage.getItem('flappyBirdHighScore') || 0;
let gameSpeed = 1.5; 
let gravity = 0.35; 


const bird = {
  x: 100,
  y: canvas.height / 2,
  width: 30,
  height: 30,
  velocity: 0,
  jumpPower: -8, 
  color: '#FFD700'
};


let pipes = [];
const pipeWidth = 60;
const pipeGap = 180; 


let clouds = [];


function init() {
  updateHighScoreDisplay();
  generateClouds();
  gameLoop();
  
  
  document.addEventListener('keydown', handleInput);
  canvas.addEventListener('click', handleInput);
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
  
  if (e.type === 'keydown') {
    if (e.code === 'Space') {
      e.preventDefault();
      if (gameState === 'playing') {
        bird.velocity = bird.jumpPower;
      } else if (gameState === 'start') {
        startGame();
      } else if (gameState === 'gameOver') {
        restartGame();
      }
    }
  } else if (e.type === 'click') {
    if (gameState === 'playing') {
      bird.velocity = bird.jumpPower;
    } else if (gameState === 'start') {
      startGame();
    } else if (gameState === 'gameOver') {
      restartGame();
    }
  }
}

function startGame() {
  gameState = 'playing';
  score = 0;
  pipes = [];
  bird.x = 100;
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  document.getElementById('startScreen').style.display = 'none';
  generateFirstPipe();
}

function restartGame() {
  gameState = 'playing';
  score = 0;
  pipes = [];
  bird.x = 100;
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  document.getElementById('gameOver').style.display = 'none';
  generateFirstPipe();
}

function generateFirstPipe() {
  setTimeout(() => {
    if (gameState === 'playing') {
      addPipe();
    }
  }, 1000);
}

function addPipe() {
  const minHeight = 50;
  const maxHeight = canvas.height - pipeGap - minHeight;
  const topHeight = minHeight + Math.random() * (maxHeight - minHeight);
  
  pipes.push({
    x: canvas.width,
    topHeight: topHeight,
    bottomY: topHeight + pipeGap,
    bottomHeight: canvas.height - (topHeight + pipeGap),
    scored: false
  });
}

function updateGame() {
  if (gameState !== 'playing') return;
  
  
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
  
  
  if (pipes.length === 0 || (pipes.length > 0 && pipes[pipes.length - 1].x < canvas.width - 300)) {
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
  
  if (bird.y + bird.height > canvas.height - 10 || bird.y < 10) {
    gameOver();
    return;
  }
  
  
  pipes.forEach(pipe => {
    
    const birdLeft = bird.x + 8;
    const birdRight = bird.x + bird.width - 8;
    const birdTop = bird.y + 8;
    const birdBottom = bird.y + bird.height - 8;
    
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
