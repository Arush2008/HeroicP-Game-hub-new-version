// Games Hub JavaScript
let selectedRating = 0;
let isAdminMode = false;
const ADMIN_PASSWORD = "Arush@100"; // Change this to your preferred password

// Cloud storage instance
let cloudStorage = null;
let isCloudConnected = false;
let allFeedbacks = [];

async function initializeCloudStorage() {
    try {
        cloudStorage = new window.CloudStorage();
        isCloudConnected = await cloudStorage.init();
        
        // Load feedbacks from cloud
        allFeedbacks = await cloudStorage.loadFeedbacks();
        
        console.log(isCloudConnected ? 'Cloud storage connected' : 'Using local storage fallback');
        displayFeedbacks();
    } catch (error) {
        console.error('Cloud storage initialization failed:', error);
        isCloudConnected = false;
        // Fallback to localStorage
        allFeedbacks = JSON.parse(localStorage.getItem('gameFeedbacks')) || [];
        displayFeedbacks();
    }
}

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
async function submitFeedback() {
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
    date: new Date().toLocaleDateString(),
    timestamp: Date.now(),
    id: 'feedback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  };
  
  // Add to feedbacks array
  allFeedbacks.unshift(feedbackData);
  
  // Save to cloud storage
  if (cloudStorage) {
    await cloudStorage.saveFeedbacks(allFeedbacks);
  }
  
  // Clear form
  document.getElementById('playerName').value = '';
  document.getElementById('feedbackText').value = '';
  selectedRating = 0;
  updateStarDisplay();
  
  // Refresh display
  displayFeedbacks();
  
  // Show success message
  showSuccessMessage();
}

function saveFeedbackToLocalStorage(feedbackData) {
  let feedbacks = JSON.parse(localStorage.getItem('gameFeedbacks')) || [];
  feedbacks.unshift(feedbackData);
  localStorage.setItem('gameFeedbacks', JSON.stringify(feedbacks));
  displayFeedbacks();
}

function showSuccessMessage() {
  const successMsg = document.createElement('div');
  successMsg.textContent = isCloudConnected ? 
    'Thank you! Your review has been shared across all devices! 🌐✨' : 
    'Thank you! Your review has been saved locally! 💾';
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
    max-width: 300px;
    text-align: center;
  `;
  
  document.body.appendChild(successMsg);
  
  setTimeout(() => {
    successMsg.style.animation = 'slideOutRight 0.5s ease-out';
    setTimeout(() => successMsg.remove(), 500);
  }, 4000);
}

function displayFeedbacks() {
  const feedbackList = document.getElementById('feedbackList');
  
  if (allFeedbacks.length === 0) {
    feedbackList.innerHTML = `
      <div class="no-feedback">
        <p>No feedback yet. Be the first to share your thoughts! 🎮</p>
      </div>
    `;
    return;
  }
  
  // In admin mode, show all feedbacks. In normal mode, show only last 50
  const feedbacksToShow = isAdminMode ? allFeedbacks : allFeedbacks.slice(0, 50);
  
  feedbackList.innerHTML = feedbacksToShow.map((feedback, index) => `
    <div class="feedback-item" data-index="${index}">
      <div class="feedback-header">
        <div>
          <span class="feedback-name">${escapeHtml(feedback.name)}</span>
          <span class="feedback-rating">${'⭐'.repeat(feedback.rating)}</span>
        </div>
        <div class="feedback-controls">
          <span class="feedback-date">${feedback.date}</span>
          ${isAdminMode ? `<button class="delete-btn" onclick="deleteFeedback('${feedback.id || index}')" title="Delete feedback">🗑️</button>` : ''}
        </div>
      </div>
      <div class="feedback-text">${escapeHtml(feedback.text)}</div>
    </div>
  `).join('');
  
  // Show admin info if in admin mode
  if (isAdminMode && allFeedbacks.length > 50) {
    const adminInfo = document.createElement('div');
    adminInfo.className = 'admin-info';
    adminInfo.innerHTML = `
      <p><strong>Admin Mode:</strong> Showing all ${allFeedbacks.length} reviews (normally only 50 are shown to users)</p>
    `;
    feedbackList.insertBefore(adminInfo, feedbackList.firstChild);
  }
  
  // Show connection status
  const connectionStatus = document.createElement('div');
  connectionStatus.className = 'connection-status';
  connectionStatus.innerHTML = `
    <p style="font-size: 0.8em; color: #666; text-align: center; margin-top: 10px;">
      ${isCloudConnected ? '🌐 Reviews synced across all devices!' : '💾 Reviews saved locally only - use refresh button to check for updates'}
    </p>
  `;
  feedbackList.appendChild(connectionStatus);
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
  // Initialize cloud storage first
  initializeCloudStorage();
  
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
  
  // Auto-refresh feedbacks every 30 seconds to check for new reviews from other devices
  setInterval(async () => {
    if (cloudStorage && isCloudConnected) {
      const latestFeedbacks = await cloudStorage.loadFeedbacks();
      if (latestFeedbacks.length !== allFeedbacks.length) {
        allFeedbacks = latestFeedbacks;
        displayFeedbacks();
        console.log('Feedbacks refreshed from cloud');
      }
    }
  }, 30000);
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

async function initializeSampleFeedback() {
  // If no feedbacks exist yet, add some sample ones
  if (allFeedbacks.length === 0) {
    const sampleFeedbacks = [
      {
        name: "GameMaster",
        text: "Love the Rock Paper Scissors game! The animations are so smooth and the auto-play feature is genius. Great work HeroicP!",
        rating: 5,
        date: "7/1/2025",
        timestamp: Date.now() - 86400000,
        id: 'sample_1'
      },
      {
        name: "FlappyFan",
        text: "Flappy Bird is a bit weired as it is a bit glitchy but other games are amazing! The graphics are beautiful and it runs so smoothly!",
        rating: 3,
        date: "7/1/2025",
        timestamp: Date.now() - 43200000,
        id: 'sample_2'
      },
      {
        name: "JumpingJoe",
        text: "Doodle Jump is addictive! I love the moving platforms feature. Spent hours trying to beat my high score. Amazing games collection!",
        rating: 5,
        date: "7/1/2025",
        timestamp: Date.now() - 21600000,
        id: 'sample_3'
      }
    ];
    
    allFeedbacks = sampleFeedbacks;
    
    // Save to cloud storage if available
    if (cloudStorage) {
      await cloudStorage.saveFeedbacks(allFeedbacks);
    }
  }
  
  displayFeedbacks();
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

async function deleteFeedback(id) {
  if (!isAdminMode) return;
  
  if (confirm("Are you sure you want to delete this feedback?")) {
    if (typeof id === 'string' && id.startsWith('feedback_')) {
      // Delete by ID
      allFeedbacks = allFeedbacks.filter(feedback => feedback.id !== id);
    } else {
      // Delete by index (fallback)
      const index = parseInt(id);
      if (!isNaN(index) && index >= 0 && index < allFeedbacks.length) {
        allFeedbacks.splice(index, 1);
      }
    }
    
    // Save updated feedbacks to cloud
    if (cloudStorage) {
      await cloudStorage.saveFeedbacks(allFeedbacks);
    }
    
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

// Manual refresh function for checking new reviews
async function refreshFeedbacks() {
  const refreshBtn = document.querySelector('.refresh-btn');
  const originalText = refreshBtn.innerHTML;
  
  // Show loading state
  refreshBtn.innerHTML = '🔄 Refreshing...';
  refreshBtn.disabled = true;
  
  try {
    if (cloudStorage && isCloudConnected) {
      const latestFeedbacks = await cloudStorage.loadFeedbacks();
      allFeedbacks = latestFeedbacks;
      displayFeedbacks();
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.textContent = 'Reviews refreshed! 🎉';
      successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(145deg, #00b894, #00a085);
        color: white;
        padding: 10px 15px;
        border-radius: 8px;
        font-size: 0.9em;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
      `;
      
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 2000);
    } else {
      // Fallback message
      alert('Using local storage - reviews are only visible on this device');
    }
  } catch (error) {
    console.error('Error refreshing feedbacks:', error);
    alert('Failed to refresh reviews. Please try again.');
  } finally {
    // Restore button state
    refreshBtn.innerHTML = originalText;
    refreshBtn.disabled = false;
  }
}
