let score = JSON.parse(localStorage.getItem('score')) || {
  wins: 0,
  losses: 0,
  ties: 0
};

let lastRound = {
  playerMove: null,
  computerMove: null,
  result: null,
};

updateScore();

let isAutoPlaying = false;
let intervalId = null;

document.querySelector('.js-rock-button').addEventListener('click', () => {
  playGame('rock');
});

document.querySelector('.js-paper-button').addEventListener('click', () => {
  playGame('paper');
});

document.querySelector('.js-scissors-button').addEventListener('click', () => {
  playGame('scissor');
});

document.querySelector('.js-reset-score-button').addEventListener('click', () => {
  score = { wins: 0, losses: 0, ties: 0 };
  localStorage.removeItem('score');
  clearRoundDetails();
  updateScore();
  clearLastRoundDetails();
  clearScoreBreakdown();
  stopAutoPlay();
});

document.querySelector('.js-auto-play-button').addEventListener('click', () => {
  toggleAutoPlay();
});

document.querySelector('.js-show-last-round-button').addEventListener('click', () => {
  showLastRoundDetails();
});

document.querySelector('.js-show-score-breakdown-button').addEventListener('click', () => {
  showScoreBreakdown();
});

document.body.addEventListener('keydown', (event) => {
  if (event.key === 'r' || event.key === '1') {
    playGame('rock');
  } else if (event.key === 'p' || event.key === '2') {
    playGame('paper');
  } else if (event.key === 's' || event.key === '3') {
    playGame('scissor');
  }
});

function toggleAutoPlay() {
  if (!isAutoPlaying) {
    intervalId = setInterval(() => {
      const move = pickComputerMove();
      playGame(move);
    }, 1000);
    isAutoPlaying = true;
    document.querySelector('.js-auto-play-button').innerHTML = 'Stop';
  } else {
    stopAutoPlay();
  }
}

function stopAutoPlay() {
  clearInterval(intervalId);
  isAutoPlaying = false;
  document.querySelector('.js-auto-play-button').innerHTML = 'Auto Play';
}

function playGame(playerMove) {
  const computerMove = pickComputerMove();
  let result = '';

  if (playerMove === computerMove) {
    result = 'Tie.';
    score.ties++;
  } else if (
    (playerMove === 'rock' && computerMove === 'scissor') ||
    (playerMove === 'paper' && computerMove === 'rock') ||
    (playerMove === 'scissor' && computerMove === 'paper')
  ) {
    result = 'You won.';
    score.wins++;
  } else {
    result = 'You lost.';
    score.losses++;
  }

  lastRound = { playerMove, computerMove, result };

  localStorage.setItem('score', JSON.stringify(score));
  updateScore();
  clearRoundDetails();
  clearScoreBreakdown();

  const resultElement = document.querySelector('.js-result');
  const movesElement = document.querySelector('.js-moves');
  
  resultElement.textContent = result;
  resultElement.style.animation = 'none';
  resultElement.offsetHeight; 
  resultElement.style.animation = 'pulse 0.5s ease-in-out';

  movesElement.innerHTML = `
    <strong>Your Move:</strong>
    <img src="images/${playerMove}.png" class="image-icon" alt="${playerMove}" />
    <strong>VS</strong>
    <img src="images/${computerMove}.png" class="image-icon" alt="${computerMove}" />
    <strong>Computer's Move</strong>
  `;
}

function updateScore() {
  document.querySelector('.js-score').textContent = `Wins: ${score.wins} | Losses: ${score.losses} | Ties: ${score.ties}`;
}

function pickComputerMove() {
  const randomNum = Math.random();
  if (randomNum < 1 / 3) {
    return 'rock';
  } else if (randomNum < 2 / 3) {
    return 'paper';
  } else {
    return 'scissor';
  }
}

function showLastRoundDetails() {
  if (!lastRound.playerMove) {
    document.querySelector('.js-last-round-details').textContent = 'No rounds played yet.';
    return;
  }
  document.querySelector('.js-last-round-details').innerHTML = `
    Last Round:<br />
    Your move: <strong>${capitalize(lastRound.playerMove)}</strong><br />
    Computer move: <strong>${capitalize(lastRound.computerMove)}</strong><br />
    Result: <strong>${lastRound.result}</strong>
  `;
}

function showScoreBreakdown() {
  const totalGames = score.wins + score.losses + score.ties;
  if (totalGames === 0) {
    document.querySelector('.js-score-breakdown').textContent = 'No games played yet.';
    return;
  }
  
  document.querySelector('.js-score-breakdown').innerHTML = `
    Total Games Played: <strong>${totalGames}</strong><br />
    Your Wins: <strong>${score.wins}</strong><br />
    Your Losses: <strong>${score.losses}</strong><br />
    Your Ties: <strong>${score.ties}</strong><br />
    <hr />
    Computer Wins: <strong>${score.losses}</strong><br />
    Computer Losses: <strong>${score.wins}</strong><br />
    Computer Ties: <strong>${score.ties}</strong>
  `;
}

function clearLastRoundDetails() {
  document.querySelector('.js-last-round-details').textContent = '';
}

function clearScoreBreakdown() {
  document.querySelector('.js-score-breakdown').textContent = '';
}

function clearRoundDetails() {
  document.querySelector('.js-result').textContent = '';
  document.querySelector('.js-moves').textContent = '';
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}


function goHome() {
  window.location.href = 'index.html';
}
