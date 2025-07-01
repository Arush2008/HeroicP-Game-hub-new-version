// Games Hub JavaScript
let selectedRating = 0;
let isAdminMode = false;
const ADMIN_PASSWORD = "Arush@100"; // Change this to your preferred password

function playGame(gameType) {
  switch(gameType) {
    case 'rock-paper-scissors':
      window.location.href = '12-Rock-Paper-Scessor.html';
      break;
    case 'flappy-bird':
      window.location.href = 'flappy-bird.html';
      break;
    case 'doodle-jump':
      window.location.href = 'doodle-jump.html';
      break;
    default:
      alert('Game coming soon!');
  }
}

// Feedback System
function submitFeedback() {
  const playerName = document.getElementById('playerName').value.trim();
  const feedbackText = document.getElementById('feedbackText').value.trim();
  
  if (!playerName) {
    alert('Please enter your name!');
    return;
  }
  
  if (!feedbackText) {
    alert('Please enter your feedback!');
    return;
  }
  
  if (selectedRating === 0) {
    alert('Please select a rating!');
    return;
  }
  
  const feedbackData = {
    name: playerName,
    text: feedbackText,
    rating: selectedRating,
    date: new Date().toLocaleDateString()
  };
  
  // Save to localStorage
  let feedbacks = JSON.parse(localStorage.getItem('gameFeedbacks')) || [];
  feedbacks.unshift(feedbackData); // Add to beginning
  
  // Keep all feedbacks for admin, but note that we only show 50 to regular users
  // No longer limiting to 50 in storage - let admin see everything
  
  localStorage.setItem('gameFeedbacks', JSON.stringify(feedbacks));
  
  // Clear form
  document.getElementById('playerName').value = '';
  document.getElementById('feedbackText').value = '';
  selectedRating = 0;
  updateStarDisplay();
  
  // Refresh feedback display
  displayFeedbacks();
  
  // Show success message
  showSuccessMessage();
}

function showSuccessMessage() {
  const successMsg = document.createElement('div');
  successMsg.textContent = 'Thank you for your feedback! 🎉';
  successMsg.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(145deg, #00b894, #00a085);
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    font-weight: bold;
    z-index: 1000;
    animation: slideInRight 0.5s ease-out;
  `;
  
  document.body.appendChild(successMsg);
  
  setTimeout(() => {
    successMsg.style.animation = 'slideOutRight 0.5s ease-out';
    setTimeout(() => successMsg.remove(), 500);
  }, 3000);
}

function displayFeedbacks() {
  const feedbackList = document.getElementById('feedbackList');
  const feedbacks = JSON.parse(localStorage.getItem('gameFeedbacks')) || [];
  
  if (feedbacks.length === 0) {
    feedbackList.innerHTML = `
      <div class="no-feedback">
        <p>No feedback yet. Be the first to share your thoughts! 🎮</p>
      </div>
    `;
    return;
  }
  
  // In admin mode, show all feedbacks. In normal mode, show only last 50
  const feedbacksToShow = isAdminMode ? feedbacks : feedbacks.slice(0, 50);
  
  feedbackList.innerHTML = feedbacksToShow.map((feedback, index) => `
    <div class="feedback-item" data-index="${index}">
      <div class="feedback-header">
        <div>
          <span class="feedback-name">${escapeHtml(feedback.name)}</span>
          <span class="feedback-rating">${'⭐'.repeat(feedback.rating)}</span>
        </div>
        <div class="feedback-controls">
          <span class="feedback-date">${feedback.date}</span>
          ${isAdminMode ? `<button class="delete-btn" onclick="deleteFeedback(${index})" title="Delete feedback">🗑️</button>` : ''}
        </div>
      </div>
      <div class="feedback-text">${escapeHtml(feedback.text)}</div>
    </div>
  `).join('');
  
  // Show admin info if in admin mode
  if (isAdminMode && feedbacks.length > 50) {
    const adminInfo = document.createElement('div');
    adminInfo.className = 'admin-info';
    adminInfo.innerHTML = `
      <p><strong>Admin Mode:</strong> Showing all ${feedbacks.length} reviews (normally only 50 are shown to users)</p>
    `;
    feedbackList.insertBefore(adminInfo, feedbackList.firstChild);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateStarDisplay() {
  const stars = document.querySelectorAll('.star');
  stars.forEach((star, index) => {
    if (index < selectedRating) {
      star.classList.add('active');
      star.style.opacity = '1';
      star.style.transform = 'scale(1.1)';
    } else {
      star.classList.remove('active');
      star.style.opacity = '0.5';
      star.style.transform = 'scale(1)';
    }
  });
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
  const gameCards = document.querySelectorAll('.game-card');
  
  gameCards.forEach((card, index) => {
    // Add click effect
    card.addEventListener('click', function(e) {
      if (!e.target.classList.contains('play-button')) {
        const playButton = this.querySelector('.play-button');
        playButton.click();
      }
    });
    
    // Add random floating animation delays
    const icon = card.querySelector('.game-icon');
    if (icon) {
      icon.style.animationDelay = `${index * 0.5}s`;
    }
  });
  
  // Add particle effect on hover (optional enhancement)
  gameCards.forEach(card => {
    card.addEventListener('mouseenter', createParticles);
  });
  
  // Initialize feedback system
  setupFeedbackSystem();
  initializeSampleFeedback();
  displayFeedbacks();
});

function setupFeedbackSystem() {
  // Star rating system
  const stars = document.querySelectorAll('.star');
  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      selectedRating = index + 1;
      updateStarDisplay();
    });
    
    star.addEventListener('mouseenter', () => {
      // Only show hover effect if no rating is selected
      if (selectedRating === 0) {
        stars.forEach((s, i) => {
          if (i <= index) {
            s.style.opacity = '1';
            s.style.transform = 'scale(1.1)';
          } else {
            s.style.opacity = '0.5';
            s.style.transform = 'scale(1)';
          }
        });
      }
    });
  });
  
  // Reset star hover effect only if no rating is selected
  document.querySelector('.stars').addEventListener('mouseleave', () => {
    if (selectedRating === 0) {
      stars.forEach(star => {
        star.style.opacity = '0.5';
        star.style.transform = 'scale(1)';
      });
    } else {
      updateStarDisplay();
    }
  });
}

function createParticles(e) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  
  for (let i = 0; i < 5; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = rect.left + Math.random() * rect.width + 'px';
    particle.style.top = rect.top + Math.random() * rect.height + 'px';
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.background = 'rgba(255, 255, 255, 0.8)';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '1000';
    particle.style.animation = 'particleFloat 2s ease-out forwards';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 2000);
  }
}

// Add CSS for particle animation
const style = document.createElement('style');
style.textContent = `
  @keyframes particleFloat {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-100px) scale(0.5);
    }
  }
`;
document.head.appendChild(style);

function initializeSampleFeedback() {
  // Add sample feedback if none exists
  let feedbacks = JSON.parse(localStorage.getItem('gameFeedbacks')) || [];
  
  if (feedbacks.length === 0) {
    const sampleFeedbacks = [
      {
        name: "GameMaster",
        text: "Love the Rock Paper Scissors game! The animations are so smooth and the auto-play feature is genius. Great work HeroicP!",
        rating: 5,
        date: "7/1/2025"
      },
      {
        name: "FlappyFan",
        text: "Flappy Bird is a bit weired as it is a bit glitchy but other games are amazing! The graphics are beautiful and it runs so smoothly!",
        rating: 3,
        date: "7/1/2025"
      },
      {
        name: "JumpingJoe",
        text: "Doodle Jump is addictive! I love the moving platforms feature. Spent hours trying to beat my high score. Amazing games collection!",
        rating: 5,
        date: "7/1/2025"
      }
    ];
    
    localStorage.setItem('gameFeedbacks', JSON.stringify(sampleFeedbacks));
  }
}

// Admin Functions
function toggleAdminMode() {
  if (!isAdminMode) {
    const password = prompt("Enter admin password:");
    if (password === ADMIN_PASSWORD) {
      isAdminMode = true;
      displayFeedbacks();
      showAdminMessage("Admin mode activated! You can now delete feedback.");
    } else if (password !== null) {
      alert("Incorrect password!");
    }
  } else {
    isAdminMode = false;
    displayFeedbacks();
    showAdminMessage("Admin mode deactivated.");
  }
}

function deleteFeedback(index) {
  if (!isAdminMode) return;
  
  if (confirm("Are you sure you want to delete this feedback?")) {
    let feedbacks = JSON.parse(localStorage.getItem('gameFeedbacks')) || [];
    feedbacks.splice(index, 1);
    localStorage.setItem('gameFeedbacks', JSON.stringify(feedbacks));
    displayFeedbacks();
    showAdminMessage("Feedback deleted successfully!");
  }
}

function showAdminMessage(message) {
  const adminMsg = document.createElement('div');
  adminMsg.textContent = message;
  adminMsg.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background: linear-gradient(145deg, #6c5ce7, #a29bfe);
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    font-weight: bold;
    z-index: 1000;
    animation: slideInLeft 0.5s ease-out;
    max-width: 300px;
  `;

  document.body.appendChild(adminMsg);
  
  setTimeout(() => {
    adminMsg.style.animation = 'slideOutLeft 0.5s ease-out';
    setTimeout(() => adminMsg.remove(), 500);
  }, 3000);
}

// Secret admin access (press Ctrl+Shift+A)
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    e.preventDefault();
    toggleAdminMode();
  }
});
