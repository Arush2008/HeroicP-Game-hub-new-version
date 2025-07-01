// Games Hub JavaScript
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
});

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
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(style);
