// Game state
let game = {
  canvas: null,
  ctx: null,
  snake: [],
  direction: { x: 0, y: 0 },
  nextDirection: { x: 0, y: 0 },
  apple: { x: 0, y: 0 },
  score: 0,
  highScore: 0,
  gameRunning: false,
  gamePaused: false,
  gameStarted: false,
  gameSpeed: 150,
  gridSize: 20
};

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
  game.canvas = document.getElementById('gameCanvas');
  game.ctx = game.canvas.getContext('2d');
  
  // Load high score from localStorage
  game.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
  updateHighScore();
  
  // Set up event listeners
  document.querySelector('.js-start-button').addEventListener('click', startGame);
  document.querySelector('.js-restart-button').addEventListener('click', restartGame);
  
  // Keyboard controls
  document.addEventListener('keydown', handleKeyPress);
  
  initializeGame();
});

function initializeGame() {
  // Initialize snake in the center
  const centerX = Math.floor(game.canvas.width / (2 * game.gridSize)) * game.gridSize;
  const centerY = Math.floor(game.canvas.height / (2 * game.gridSize)) * game.gridSize;
  
  game.snake = [
    { x: centerX, y: centerY },
    { x: centerX - game.gridSize, y: centerY },
    { x: centerX - 2 * game.gridSize, y: centerY }
  ];
  
  game.direction = { x: game.gridSize, y: 0 };
  game.nextDirection = { x: game.gridSize, y: 0 };
  game.score = 0;
  game.gameSpeed = 150; // Fixed medium difficulty
  
  spawnApple();
  draw();
  updateScore();
}

function startGame() {
  document.querySelector('.js-start-screen').style.display = 'none';
  document.querySelector('.js-game-overlay').style.display = 'none';
  game.gameRunning = true;
  game.gameStarted = true;
  gameLoop();
}

function restartGame() {
  document.querySelector('.js-game-over-screen').style.display = 'none';
  document.querySelector('.js-game-overlay').style.display = 'none';
  game.gameRunning = true;
  initializeGame();
  gameLoop();
}

function handleKeyPress(event) {
  if (!game.gameRunning && !game.gamePaused) return;
  
  const key = event.key.toLowerCase();
  
  // Prevent default scrolling behavior for game controls
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd'].includes(key)) {
    event.preventDefault();
  }
  
  // Pause/Resume
  if (key === ' ') {
    togglePause();
    return;
  }
  
  if (game.gamePaused) return;
  
  // Movement controls
  switch (key) {
    case 'arrowup':
    case 'w':
      if (game.direction.y === 0) {
        game.nextDirection = { x: 0, y: -game.gridSize };
      }
      break;
    case 'arrowdown':
    case 's':
      if (game.direction.y === 0) {
        game.nextDirection = { x: 0, y: game.gridSize };
      }
      break;
    case 'arrowleft':
    case 'a':
      if (game.direction.x === 0) {
        game.nextDirection = { x: -game.gridSize, y: 0 };
      }
      break;
    case 'arrowright':
    case 'd':
      if (game.direction.x === 0) {
        game.nextDirection = { x: game.gridSize, y: 0 };
      }
      break;
  }
}

function togglePause() {
  game.gamePaused = !game.gamePaused;
  if (!game.gamePaused) {
    gameLoop();
  }
}

function gameLoop() {
  if (!game.gameRunning || game.gamePaused) return;
  
  update();
  draw();
  
  setTimeout(() => gameLoop(), game.gameSpeed);
}

function update() {
  // Update direction
  game.direction = { ...game.nextDirection };
  
  // Move snake head
  const head = { ...game.snake[0] };
  head.x += game.direction.x;
  head.y += game.direction.y;
  
  // Check wall collisions
  if (head.x < 0 || head.x >= game.canvas.width || 
      head.y < 0 || head.y >= game.canvas.height) {
    gameOver();
    return;
  }
  
  // Check self collision
  if (game.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameOver();
    return;
  }
  
  game.snake.unshift(head);
  
  // Check apple collision
  if (head.x === game.apple.x && head.y === game.apple.y) {
    // Snake grows (don't remove tail)
    game.score += 10;
    updateScore();
    spawnApple();
    
    // Increase speed slightly
    const speedIncrease = 3; // Fixed medium difficulty speed increase
    game.gameSpeed = Math.max(50, game.gameSpeed - speedIncrease);
  } else {
    // Remove tail (snake moves without growing)
    game.snake.pop();
  }
}

function draw() {
  // Clear canvas
  game.ctx.fillStyle = '#2c3e50';
  game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
  
  // Draw grid (subtle)
  game.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  game.ctx.lineWidth = 1;
  for (let x = 0; x < game.canvas.width; x += game.gridSize) {
    game.ctx.beginPath();
    game.ctx.moveTo(x, 0);
    game.ctx.lineTo(x, game.canvas.height);
    game.ctx.stroke();
  }
  for (let y = 0; y < game.canvas.height; y += game.gridSize) {
    game.ctx.beginPath();
    game.ctx.moveTo(0, y);
    game.ctx.lineTo(game.canvas.width, y);
    game.ctx.stroke();
  }
  
  // Draw snake
  game.snake.forEach((segment, index) => {
    if (index === 0) {
      // Snake head
      game.ctx.fillStyle = '#27ae60';
      game.ctx.fillRect(segment.x, segment.y, game.gridSize, game.gridSize);
      
      // Add eyes to head
      game.ctx.fillStyle = 'white';
      const eyeSize = 3;
      const eyeOffset = 6;
      
      if (game.direction.x > 0) { // Moving right
        game.ctx.fillRect(segment.x + eyeOffset, segment.y + 4, eyeSize, eyeSize);
        game.ctx.fillRect(segment.x + eyeOffset, segment.y + 13, eyeSize, eyeSize);
      } else if (game.direction.x < 0) { // Moving left
        game.ctx.fillRect(segment.x + 11, segment.y + 4, eyeSize, eyeSize);
        game.ctx.fillRect(segment.x + 11, segment.y + 13, eyeSize, eyeSize);
      } else if (game.direction.y > 0) { // Moving down
        game.ctx.fillRect(segment.x + 4, segment.y + eyeOffset, eyeSize, eyeSize);
        game.ctx.fillRect(segment.x + 13, segment.y + eyeOffset, eyeSize, eyeSize);
      } else if (game.direction.y < 0) { // Moving up
        game.ctx.fillRect(segment.x + 4, segment.y + 11, eyeSize, eyeSize);
        game.ctx.fillRect(segment.x + 13, segment.y + 11, eyeSize, eyeSize);
      }
    } else {
      // Snake body
      const intensity = Math.max(0.3, 1 - (index / game.snake.length) * 0.7);
      game.ctx.fillStyle = `rgba(46, 204, 113, ${intensity})`;
      game.ctx.fillRect(segment.x + 1, segment.y + 1, game.gridSize - 2, game.gridSize - 2);
    }
  });
  
  // Draw apple
  game.ctx.fillStyle = '#e74c3c';
  game.ctx.fillRect(game.apple.x, game.apple.y, game.gridSize, game.gridSize);
  
  // Add apple highlight
  game.ctx.fillStyle = '#c0392b';
  game.ctx.fillRect(game.apple.x + 2, game.apple.y + 2, game.gridSize - 4, game.gridSize - 4);
  
  // Add apple shine
  game.ctx.fillStyle = '#ff6b6b';
  game.ctx.fillRect(game.apple.x + 4, game.apple.y + 4, 6, 6);
  
  // If paused, show pause message
  if (game.gamePaused) {
    game.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    
    game.ctx.fillStyle = 'white';
    game.ctx.font = '24px Arial';
    game.ctx.textAlign = 'center';
    game.ctx.fillText('PAUSED', game.canvas.width / 2, game.canvas.height / 2);
    game.ctx.fillText('Press SPACE to resume', game.canvas.width / 2, game.canvas.height / 2 + 40);
  }
}

function spawnApple() {
  let validPosition = false;
  
  while (!validPosition) {
    game.apple.x = Math.floor(Math.random() * (game.canvas.width / game.gridSize)) * game.gridSize;
    game.apple.y = Math.floor(Math.random() * (game.canvas.height / game.gridSize)) * game.gridSize;
    
    // Make sure apple doesn't spawn on snake
    validPosition = !game.snake.some(segment => 
      segment.x === game.apple.x && segment.y === game.apple.y
    );
  }
}

function updateScore() {
  document.querySelector('.js-score').textContent = `Score: ${game.score}`;
  
  // Add pulse animation
  const scoreElement = document.querySelector('.js-score');
  scoreElement.classList.remove('score-pulse');
  setTimeout(() => scoreElement.classList.add('score-pulse'), 10);
}

function updateHighScore() {
  document.querySelector('.js-high-score').textContent = `High Score: ${game.highScore}`;
}

function gameOver() {
  game.gameRunning = false;
  game.gameStarted = false;
  
  // Check for new high score
  let isNewHighScore = false;
  if (game.score > game.highScore) {
    game.highScore = game.score;
    localStorage.setItem('snakeHighScore', game.highScore.toString());
    updateHighScore();
    isNewHighScore = true;
  }
  
  // Show game over screen
  document.querySelector('.js-final-score').textContent = `Final Score: ${game.score}`;
  
  if (isNewHighScore) {
    document.querySelector('.js-high-score-message').textContent = 'NEW HIGH SCORE! 🎉';
  } else {
    const remaining = game.highScore - game.score;
    document.querySelector('.js-high-score-message').textContent = 
      remaining > 0 ? `${remaining} points to beat high score!` : '';
  }
  
  document.querySelector('.js-game-over-screen').style.display = 'block';
  document.querySelector('.js-game-overlay').style.display = 'flex';
}

function goHome() {
  window.location.href = 'index.html';
}
