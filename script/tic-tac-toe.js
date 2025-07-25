// Game state variables
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameMode = '';
let gameActive = true;
let isOnlineGame = false;
let roomCode = '';
let isHost = false;
let opponentConnected = false;
let botStarts = false; // Track if bot starts this round
let playerMark = 'X';  // Always player is X
let botMark = 'O';     // Always bot is O

// Winning combinations
const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6] // Diagonals
];

// DOM elements
const modeSelection = document.querySelector('.js-mode-selection');
const onlineSetup = document.querySelector('.js-online-setup');
const gameBoard_el = document.querySelector('.js-game-board');
const gameOver = document.querySelector('.js-game-over');
const currentPlayerEl = document.querySelector('.js-current-player');
const gameModeDisplay = document.querySelector('.js-game-mode-display');
const cells = document.querySelectorAll('.js-cell');
const winnerText = document.querySelector('.js-winner-text');

// Online multiplayer elements
const roomInterface = document.querySelector('.js-room-interface');
const roomCodeDisplay = document.querySelector('.js-room-code-display');
const joinInput = document.querySelector('.js-join-input');
const codeDisplay = document.querySelector('.js-code');
const waiting = document.querySelector('.js-waiting');
const codeInput = document.querySelector('.js-code-input');

// Initialize game
function init() {
  showModeSelection();
  setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
  cells.forEach((cell, index) => {
    cell.addEventListener('click', () => makeMove(index));
  });
  
  // Format room code input
  codeInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });
}

// Mode selection functions
function selectMode(mode) {
  gameMode = mode;
  
  if (mode === 'online') {
    showOnlineSetup();
  } else {
    startGame(mode);
  }
}

function showModeSelection() {
  hideAllScreens();
  modeSelection.style.display = 'block';
}

function showOnlineSetup() {
  hideAllScreens();
  onlineSetup.style.display = 'block';
  roomInterface.style.display = 'none';
}

function hideAllScreens() {
  modeSelection.style.display = 'none';
  onlineSetup.style.display = 'none';
  gameBoard_el.style.display = 'none';
  gameOver.style.display = 'none';
}

// Online multiplayer functions
function createRoom() {
  roomCode = generateRoomCode();
  isHost = true;
  isOnlineGame = true;
  
  roomInterface.style.display = 'block';
  roomCodeDisplay.style.display = 'block';
  joinInput.style.display = 'none';
  codeDisplay.textContent = roomCode;
  waiting.style.display = 'block';
  
  // Simulate waiting for opponent (in real implementation, this would connect to a server)
  setTimeout(() => {
    simulateOpponentJoin();
  }, 3000);
}

function showJoinRoom() {
  roomInterface.style.display = 'block';
  roomCodeDisplay.style.display = 'none';
  joinInput.style.display = 'block';
}

function joinRoom() {
  const enteredCode = codeInput.value.trim();
  if (enteredCode.length === 4) {
    isHost = false;
    isOnlineGame = true;
    roomCode = enteredCode;
    
    // Simulate successful room join (in real implementation, this would validate with server)
    simulateRoomJoin();
  } else {
    alert('Please enter a valid 4-character room code.');
  }
}

function simulateOpponentJoin() {
  opponentConnected = true;
  waiting.style.display = 'none';
  waiting.textContent = 'Opponent connected! Starting game...';
  waiting.style.display = 'block';
  
  setTimeout(() => {
    startGame('online');
  }, 1500);
}

function simulateRoomJoin() {
  opponentConnected = true;
  codeInput.value = '';
  joinInput.innerHTML = '<h3>Joining room...</h3><p>Connected successfully!</p>';
  
  setTimeout(() => {
    startGame('online');
  }, 1500);
}

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Game functions
function startGame(mode) {
  gameMode = mode;
  gameActive = true;

  // Always keep player as 'X' and bot as 'O'
  playerMark = 'X';
  botMark = 'O';

  // Alternate starter if playing vs bot
  if (mode === 'bot') {
    botStarts = !botStarts;
    currentPlayer = botStarts ? botMark : playerMark;
  } else {
    currentPlayer = 'X';
  }

  gameBoard = ['', '', '', '', '', '', '', '', ''];
  
  hideAllScreens();
  gameBoard_el.style.display = 'block';
  
  updateDisplay();
  clearBoard();
  
  // Set game mode display text
  let modeText = '';
  switch (mode) {
    case 'bot':
      modeText = '(vs AI Bot)';
      break;
    case 'local':
      modeText = '(Local Multiplayer)';
      break;
    case 'online':
      modeText = `(Online - Room: ${roomCode})`;
      break;
  }
  gameModeDisplay.textContent = modeText;

  // If bot starts, make bot move immediately
  if (mode === 'bot' && currentPlayer === botMark) {
    setTimeout(makeBotMove, 500);
  }
}

function makeMove(index) {
  if (gameBoard[index] !== '' || !gameActive) {
    return;
  }
  
  // For online mode, check if it's player's turn
  if (gameMode === 'online') {
    if ((isHost && currentPlayer === 'O') || (!isHost && currentPlayer === 'X')) {
      return; // Not player's turn
    }
  }

  // For bot mode, only allow player to move on their mark
  if (gameMode === 'bot' && currentPlayer !== playerMark) {
    return;
  }
  
  // Make the move
  gameBoard[index] = currentPlayer;
  updateCell(index, currentPlayer);
  
  if (checkWin()) {
    if (gameMode === 'bot') {
      endGame(currentPlayer === playerMark ? 'You Win!' : 'AI Bot Wins! Better luck next time!');
    } else {
      endGame(`Player ${currentPlayer} Wins!`);
    }
    return;
  }
  
  if (checkDraw()) {
    endGame("It's a Draw!");
    return;
  }
  
  // Switch players
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateDisplay();
  
  // Bot move for single player mode
  if (gameMode === 'bot' && currentPlayer === botMark && gameActive) {
    setTimeout(makeBotMove, 500);
  }
  
  // Simulate online opponent move
  if (gameMode === 'online' && gameActive) {
    setTimeout(simulateOnlineOpponentMove, 1000);
  }
}

function makeBotMove() {
  if (!gameActive) return;
  
  // Unbeatable AI using minimax algorithm
  const bestMove = getBestMove(botMark, playerMark);
  if (bestMove !== -1) {
    gameBoard[bestMove] = botMark;
    updateCell(bestMove, botMark);
    
    if (checkWin()) {
      endGame(botMark === playerMark ? 'You Win!' : 'AI Bot Wins! Better luck next time!');
      return;
    }
    
    if (checkDraw()) {
      endGame("It's a Draw!");
      return;
    }
    
    currentPlayer = playerMark;
    updateDisplay();
  }
}

// Minimax algorithm for unbeatable AI
function getBestMove(ai, human) {
  let bestScore = -Infinity;
  let bestMove = -1;
  
  for (let i = 0; i < 9; i++) {
    if (gameBoard[i] === '') {
      gameBoard[i] = ai;
      let score = minimax(gameBoard, 0, false, ai, human);
      gameBoard[i] = '';
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  
  return bestMove;
}

function minimax(board, depth, isMaximizing, ai, human) {
  const winner = checkWinnerForMinimax(board);
  
  if (winner === ai) return 1;
  if (winner === human) return -1;
  if (board.every(cell => cell !== '')) return 0;
  
  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = ai;
        let score = minimax(board, depth + 1, false, ai, human);
        board[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = human;
        let score = minimax(board, depth + 1, true, ai, human);
        board[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkWinnerForMinimax(board) {
  for (let combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function updateCell(index, player) {
  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
}

function updateDisplay() {
  let displayText = '';
  
  switch (gameMode) {
    case 'bot':
      displayText = currentPlayer === playerMark ? "Your Turn" : "AI Bot's Turn";
      break;
    case 'local':
      displayText = `Player ${currentPlayer}'s Turn`;
      break;
    case 'online':
      if ((isHost && currentPlayer === 'X') || (!isHost && currentPlayer === 'O')) {
        displayText = "Your Turn";
      } else {
        displayText = "Opponent's Turn";
      }
      break;
  }
  
  currentPlayerEl.textContent = displayText;
}

function checkWin() {
  return winningCombinations.some(combination => {
    const [a, b, c] = combination;
    return gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c];
  });
}

function checkDraw() {
  return gameBoard.every(cell => cell !== '');
}

function endGame(message) {
  gameActive = false;
  winnerText.textContent = message;
  
  setTimeout(() => {
    hideAllScreens();
    gameOver.style.display = 'block';
  }, 1500);
}

function clearBoard() {
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('x', 'o');
  });
}

function newGame() {
  startGame(gameMode);
}

function playAgain() {
  if (gameMode === 'online') {
    // For online mode, might want to check if opponent wants to play again
    startGame(gameMode);
  } else {
    startGame(gameMode);
  }
}

function backToModes() {
  // Reset online game state
  isOnlineGame = false;
  opponentConnected = false;
  roomCode = '';
  isHost = false;
  
  showModeSelection();
}

// Navigation function
function goHome() {
  window.location.href = 'index.html';
}

// Simulate online opponent move (unchanged)
function simulateOnlineOpponentMove() {
  if (!gameActive) return;
  if ((isHost && currentPlayer === 'X') || (!isHost && currentPlayer === 'O')) {
    return; // It's still player's turn
  }
  
  // Simulate opponent move (random available move)
  const availableMoves = gameBoard.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
  
  if (availableMoves.length > 0) {
    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    gameBoard[randomMove] = currentPlayer;
    updateCell(randomMove, currentPlayer);
    
    if (checkWin()) {
      const winner = isHost ? (currentPlayer === 'X' ? 'You' : 'Opponent') : (currentPlayer === 'O' ? 'You' : 'Opponent');
      endGame(`${winner} Win!`);
      return;
    }
    
    if (checkDraw()) {
      endGame("It's a Draw!");
      return;
    }
    
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateDisplay();
  }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', init);