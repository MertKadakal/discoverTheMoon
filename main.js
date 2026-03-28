/**
 * main.js
 * =====================================================
 * Ay'ı Keşfet — Main JavaScript
 * Handles: Navigation, Stars, Quiz, Popup, Leaderboard
 * =====================================================
 */

/* =====================================================
   GLOBAL STATE
   ===================================================== */
let currentQuestionIndex = 0;
let currentScore = 0;
let playerName = '';
let quizAnswered = false;
let currentQuizQuestions = [];

/* =====================================================
   STAR CANVAS — Animated starfield background
   ===================================================== */
(function initStars() {
  const canvas = document.getElementById('starCanvas');
  const ctx = canvas.getContext('2d');

  let stars = [];
  const STAR_COUNT = 200;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.2,
        alpha: Math.random(),
        speed: Math.random() * 0.3 + 0.05,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
      // Twinkle
      star.alpha += star.twinkleSpeed * star.twinkleDir;
      if (star.alpha >= 1 || star.alpha <= 0.1) {
        star.twinkleDir *= -1;
      }

      // Draw
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, star.alpha))})`;
      ctx.fill();
    });

    requestAnimationFrame(drawStars);
  }

  // Shooting star occasionally
  function shootingStar() {
    const sx = Math.random() * canvas.width;
    const sy = Math.random() * canvas.height * 0.4;
    const len = Math.random() * 100 + 60;
    const angle = Math.PI / 6;
    let progress = 0;

    function draw() {
      progress += 4;
      if (progress > len + 20) return;

      ctx.beginPath();
      ctx.moveTo(sx + progress * Math.cos(angle), sy + progress * Math.sin(angle));
      ctx.lineTo(
        sx + (progress - Math.min(progress, 30)) * Math.cos(angle),
        sy + (progress - Math.min(progress, 30)) * Math.sin(angle)
      );

      const opacity = Math.max(0, 1 - progress / len);
      ctx.strokeStyle = `rgba(200, 168, 75, ${opacity * 0.8})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      requestAnimationFrame(draw);
    }
    draw();
  }

  // Set up shooting star interval
  setInterval(() => {
    if (Math.random() < 0.4) shootingStar();
  }, 4000);

  window.addEventListener('resize', () => {
    resizeCanvas();
    createStars();
  });

  resizeCanvas();
  createStars();
  drawStars();
})();


/* =====================================================
   FLOATING PARTICLES on Hero
   ===================================================== */
(function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(200, 168, 75, ${Math.random() * 0.3 + 0.05});
      width: ${Math.random() * 4 + 1}px;
      height: ${Math.random() * 4 + 1}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: particleFloat ${Math.random() * 8 + 4}s ease-in-out ${Math.random() * 5}s infinite alternate;
    `;
    container.appendChild(p);
  }

  // Inject keyframes for particles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particleFloat {
      from { transform: translateY(0) translateX(0); opacity: 0.3; }
      to { transform: translateY(-${Math.random() * 50 + 20}px) translateX(${Math.random() * 30 - 15}px); opacity: 0.8; }
    }
  `;
  document.head.appendChild(style);
})();


/* =====================================================
   NAVIGATION
   ===================================================== */

// Scroll effect for navbar
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinksEl.classList.toggle('open');
});

// Close mobile nav when a link is clicked
navLinksEl.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksEl.classList.remove('open');
  });
});

/**
 * showSection — Switches between sections
 * @param {string} sectionId - The ID of the section to show
 */
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active-section');
    s.style.display = 'none';
  });

  // Show the target section
  const target = document.getElementById(sectionId);
  if (target) {
    target.style.display = 'block';
    target.classList.add('active-section');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.section === sectionId) {
      link.classList.add('active');
    }
  });

  // Special case: home section needs flex display
  if (sectionId === 'home') {
    target.style.display = 'flex';
  }
}

// Initialize: Nav link clicks
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const section = link.dataset.section === 'game' ? 'games' : link.dataset.section;
    showSection(section);
  });
});

// Global exposure for inline onclicks
window.showSection = showSection;

// Initialize default home display
document.getElementById('home').style.display = 'flex';


/* =====================================================
   INFO TABS
   ===================================================== */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;

    // Deactivate all tabs/content
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // Activate clicked
    btn.classList.add('active');
    const content = document.getElementById(tabId);
    if (content) content.classList.add('active');
  });
});


/* =====================================================
   QUIZ SYSTEM
   ===================================================== */

/**
 * startQuiz — Validates player name and begins quiz
 */
function startQuiz() {
  const nameInput = document.getElementById('playerNameInput');
  playerName = nameInput.value.trim();

  if (!playerName) {
    // Shake input to prompt user
    nameInput.style.animation = 'none';
    nameInput.offsetHeight; // Trigger reflow
    nameInput.style.animation = 'shake 0.4s ease';
    nameInput.style.borderColor = 'var(--color-error)';
    nameInput.placeholder = 'Lütfen bir kullanıcı adı gir!';

    // Add shake animation if not already in CSS
    if (!document.getElementById('shakeStyle')) {
      const style = document.createElement('style');
      style.id = 'shakeStyle';
      style.textContent = `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
      `;
      document.head.appendChild(style);
    }
    return;
  }

  // Reset quiz state
  currentQuestionIndex = 0;
  currentScore = 0;

  // Seçilecek rastgele 10 soru
  const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
  currentQuizQuestions = shuffled.slice(0, 10);

  // Show quiz game
  document.getElementById('quizStart').style.display = 'none';
  document.getElementById('quizGame').style.display = 'block';
  document.getElementById('quizResults').style.display = 'none';

  loadQuestion();
}

/**
 * loadQuestion — Loads the current question into the UI
 */
function loadQuestion() {
  const q = currentQuizQuestions[currentQuestionIndex];

  // Update question number display
  const num = String(currentQuestionIndex + 1).padStart(2, '0');
  document.getElementById('questionNumber').textContent = num;
  document.getElementById('questionText').textContent = q.question;
  document.getElementById('questionCounter').textContent = `Soru ${currentQuestionIndex + 1} / ${currentQuizQuestions.length}`;
  document.getElementById('currentScore').textContent = currentScore;

  // Update progress bar
  const progress = ((currentQuestionIndex + 1) / currentQuizQuestions.length) * 100;
  document.getElementById('progressBar').style.width = progress + '%';

  // Animate question card
  const card = document.getElementById('questionCard');
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = 'fadeInUp 0.4s ease';

  // Render options
  const letters = ['A', 'B', 'C', 'D'];
  const grid = document.getElementById('optionsGrid');
  grid.innerHTML = '';

  q.options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.id = `option-${index}`;
    btn.innerHTML = `
      <span class="option-letter">${letters[index]}</span>
      <span>${option}</span>
    `;
    btn.addEventListener('click', () => answerQuestion(index));
    grid.appendChild(btn);
  });

  quizAnswered = false;
}

/**
 * answerQuestion — Handles user selecting an answer
 * @param {number} selectedIndex - The index of the option selected
 */
function answerQuestion(selectedIndex) {
  if (quizAnswered) return;
  quizAnswered = true;

  const q = currentQuizQuestions[currentQuestionIndex];
  const allBtns = document.querySelectorAll('.option-btn');

  // Disable all buttons
  allBtns.forEach(btn => btn.disabled = true);

  if (selectedIndex === q.correct) {
    // Correct!
    allBtns[selectedIndex].classList.add('correct');
    currentScore += 10;
  } else {
    // Wrong — mark selected as wrong, highlight correct
    allBtns[selectedIndex].classList.add('wrong');
    allBtns[q.correct].classList.add('correct');
  }

  // Update score display
  document.getElementById('currentScore').textContent = currentScore;

  // Auto-advance after 1.5 seconds
  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuizQuestions.length) {
      loadQuestion();
    } else {
      showResults();
    }
  }, 1500);
}

/**
 * showResults — Displays the quiz results screen
 */
function showResults() {
  document.getElementById('quizGame').style.display = 'none';
  document.getElementById('quizResults').style.display = 'flex';

  const finalScore = currentScore;
  document.getElementById('finalScore').textContent = finalScore;

  // Determine result message
  let emoji, title, message;
  if (finalScore >= 90) {
    emoji = '🏆'; title = 'Mükemmel!'; message = 'İnanılmaz! Uzay ansiklopedisin! Tüm cevaplar neredeyse doğru!';
  } else if (finalScore >= 70) {
    emoji = '🌟'; title = 'Harika!'; message = 'Uzay hakkında çok şey biliyorsun! Biraz daha çalışırsan zirveye ulaşırsın!';
  } else if (finalScore >= 50) {
    emoji = '🚀'; title = 'İyi İş!'; message = 'Fena değil! Bilgi bölümünü inceleyerek skorunu artırabilirsin.';
  } else if (finalScore >= 30) {
    emoji = '🌙'; title = 'Devam Et!'; message = 'Bilgi bölümünü okuyup tekrar dene. Çok daha iyi yapabilirsin!';
  } else {
    emoji = '⭐'; title = 'Başlangıç!'; message = 'Uzay yolculuğuna yeni başlıyorsun. Bilgi bölümünü keşfet ve tekrar dene!';
  }

  document.getElementById('resultEmoji').textContent = emoji;
  document.getElementById('resultTitle').textContent = title;
  document.getElementById('resultMessage').textContent = message;
}

/**
 * saveAndShowLeaderboard — Saves score and displays rankings
 */
function saveAndShowLeaderboard() {
  // Load existing leaderboard from localStorage
  let leaderboard = JSON.parse(localStorage.getItem('moonQuizLeaderboard') || '[]');

  // Fire off score to Firebase
  if(window.skorKaydet) {
    window.skorKaydet(playerName, currentScore);
  }

  // Add current player's score
  leaderboard.push({ name: playerName, score: currentScore, date: new Date().toLocaleDateString('tr-TR') });

  // Sort by score (highest first), then by date (most recent first)
  leaderboard.sort((a, b) => b.score - a.score || new Date(b.date) - new Date(a.date));

  // Keep only top 20
  leaderboard = leaderboard.slice(0, 20);

  // Save back
  localStorage.setItem('moonQuizLeaderboard', JSON.stringify(leaderboard));

  // Render leaderboard
  renderLeaderboard(leaderboard);
  document.getElementById('leaderboard').style.display = 'block';

  // Scroll to leaderboard
  document.getElementById('leaderboard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * renderLeaderboard — Renders the ranking list in the UI
 * @param {Array} data - Array of player score objects
 */
function renderLeaderboard(data) {
  const list = document.getElementById('leaderboardList');
  list.innerHTML = '';

  if (data.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Henüz kayıtlı skor yok.</p>';
    return;
  }

  data.forEach((entry, index) => {
    const rank = index + 1;
    const isCurrentUser = entry.name === playerName && entry.score === currentScore;

    let rankClass = 'other', rankIcon, medalClass = 'other';
    if (rank === 1) { rankIcon = '🥇'; medalClass = 'gold'; }
    else if (rank === 2) { rankIcon = '🥈'; medalClass = 'silver'; }
    else if (rank === 3) { rankIcon = '🥉'; medalClass = 'bronze'; }
    else { rankIcon = `#${rank}`; }

    const div = document.createElement('div');
    div.className = `lb-entry ${rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : ''} ${isCurrentUser ? 'current-user' : ''}`;
    div.innerHTML = `
      <span class="lb-rank ${medalClass}">${rank <= 3 ? rankIcon : '#' + rank}</span>
      <span class="lb-name ${isCurrentUser ? 'you-badge' : ''}">${escapeHtml(entry.name)}</span>
      <span class="lb-score">${entry.score} puan</span>
    `;
    list.appendChild(div);
  });
}

/**
 * restartQuiz — Resets the quiz to the start screen
 */
function restartQuiz() {
  currentQuestionIndex = 0;
  currentScore = 0;
  quizAnswered = false;

  document.getElementById('quizStart').style.display = 'flex';
  document.getElementById('quizGame').style.display = 'none';
  document.getElementById('quizResults').style.display = 'none';
  document.getElementById('leaderboard').style.display = 'none';
  document.getElementById('playerNameInput').value = '';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * escapeHtml — Sanitizes user input for display
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}


/* =====================================================
   GAME POPUP SYSTEM
   ===================================================== */

// Store the uploaded game file URL (if any)
let gameFileUrl = null;
let gameFileName = null;

/**
 * showGamePopup — Shows the "Ready to play?" confirmation popup
 */
function showGamePopup() {
  const overlay = document.getElementById('popupOverlay');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * closePopup — Hides the game popup
 */
function closePopup() {
  const overlay = document.getElementById('popupOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * confirmGame — User confirmed they want to play
 * Downloads the game file if uploaded, otherwise shows placeholder message
 */
function confirmGame() {
  closePopup();

  if (gameFileUrl && gameFileName) {
    // If a game file has been uploaded, trigger download
    const link = document.createElement('a');
    link.href = gameFileUrl;
    link.download = gameFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('🚀 Oyun dosyası indiriliyor...', 'success');
  } else {
    // PLACEHOLDER: No game file yet — instruct user
    showToast('⚠️ Oyun dosyası henüz yüklenmedi. Lütfen bir oyun dosyası seçin.', 'warning');

    // Scroll to upload area
    document.getElementById('gameUploadSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('gameUploadSection').style.border = '1px dashed var(--color-primary)';
    setTimeout(() => {
      document.getElementById('gameUploadSection').style.border = '1px dashed var(--border-subtle)';
    }, 2000);
  }
}

/**
 * handleGameFileUpload — Handles game file being selected by user
 * @param {Event} event - File input change event
 */
function handleGameFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Store file as object URL for download
  if (gameFileUrl) URL.revokeObjectURL(gameFileUrl);
  gameFileUrl = URL.createObjectURL(file);
  gameFileName = file.name;

  const statusEl = document.getElementById('fileStatus');
  statusEl.innerHTML = `✅ Dosya yüklendi: <strong>${escapeHtml(file.name)}</strong> (${(file.size / 1024 / 1024).toFixed(2)} MB)`;

  showToast(`✅ "${file.name}" başarıyla yüklendi!`, 'success');
}

// Close popup when clicking outside the card
document.getElementById('popupOverlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('popupOverlay')) {
    closePopup();
  }
});

// Close popup with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePopup();
});


/* =====================================================
   TOAST NOTIFICATION SYSTEM
   ===================================================== */

/**
 * showToast — Shows a brief notification message
 * @param {string} message - Message to display
 * @param {string} type - 'success' | 'warning' | 'error'
 */
function showToast(message, type = 'success') {
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'toast';

  const colors = {
    success: 'var(--color-success)',
    warning: 'var(--color-primary)',
    error: 'var(--color-error)'
  };

  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: rgba(6, 12, 26, 0.95);
    border: 1px solid ${colors[type] || colors.success};
    color: var(--text-primary);
    padding: 1rem 1.5rem;
    border-radius: 12px;
    font-family: var(--font-body);
    font-size: 0.9rem;
    z-index: 9999;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
    animation: toastIn 0.4s ease;
    max-width: 380px;
    line-height: 1.4;
  `;

  toast.textContent = message;

  // Add toast animation
  if (!document.getElementById('toastStyle')) {
    const style = document.createElement('style');
    style.id = 'toastStyle';
    style.textContent = `
      @keyframes toastIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes toastOut {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(20px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.4s ease forwards';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}


/* =====================================================
   APP INITIALIZATION
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Show home section by default
  showSection('home');

  // Load existing leaderboard data if on quiz page
  const savedLB = localStorage.getItem('moonQuizLeaderboard');
  if (savedLB) {
    try {
      JSON.parse(savedLB); // Validate
    } catch(e) {
      localStorage.removeItem('moonQuizLeaderboard');
    }
  }

  console.log('🌕 Ay\'ı Keşfet — Uygulama başlatıldı!');
});
