/* ═══════════════════════════════════════════════════════
   Valentine Balloon Website — Script
   ═══════════════════════════════════════════════════════ */

// ── Balloon Data ─────────────────────────────────────────
const balloonData = [
  {
    image: 'images/memory1.jpg',
    message: 'Some moments become memories… and some memories become a part of your heart forever ❤️',
    emoji: '🎈',
    color: '#ff4d6d',
  },
  {
    image: 'images/memory2.jpg',
    message: 'With you, even the simplest days turn into something magical and unforgettable ✨',
    emoji: '🎈',
    color: '#ff85a1',
  },
  {
    image: 'images/memory3.jpg',
    message: 'You have this beautiful way of making everything feel warmer, happier, and more alive 💫',
    emoji: '🎈',
    color: '#c77dff',
  },
  {
    image: 'images/memory4.jpg',
    message: 'Every little moment we share quietly becomes one of my favorite stories 📸',
    emoji: '🎈',
    color: '#e0aaff',
  },
  {
    image: 'images/memory5.jpg',
    message: 'And this… is the girl who unknowingly became my calm, my smile, and my favorite part of every day 💖',
    emoji: '🎈',
    color: '#ff758f',
  },
  {
    // FINAL BALLOON – special proposal behaviour
    image: null,
    message: null,
    emoji: '💌',
    color: '#ffb703',
  },
];

// ── Placeholder SVGs for missing images ──────────────────
const placeholderEmojis = ['💑', '😂', '✨', '📸', '💕'];

// ── State ────────────────────────────────────────────────
let poppedCount = 0;
let musicPlaying = false;
let musicStarted = false;
let audioElement = null;

// ── DOM Ready ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  createHeartParticles();
  createSparkles();
  initAudio();
  initMusicToggle();
  initFirstInteraction();
});

// ── Preloader ────────────────────────────────────────────
function initPreloader() {
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 800);
    }, 1500);
  });
}

// ── Heart Particles (background ambience) ────────────────
function createHeartParticles() {
  const container = document.querySelector('.heart-particles');
  const hearts = ['❤', '💕', '💗', '♥', '💖', '💜'];

  for (let i = 0; i < 20; i++) {
    const heart = document.createElement('span');
    heart.className = 'heart-particle';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (Math.random() * 14 + 8) + 'px';
    heart.style.animationDuration = (Math.random() * 10 + 12) + 's';
    heart.style.animationDelay = (Math.random() * 15) + 's';
    container.appendChild(heart);
  }
}

// ── Sparkles (landing screen) ────────────────────────────
function createSparkles() {
  const landing = document.getElementById('landing-screen');

  for (let i = 0; i < 30; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.top = Math.random() * 100 + '%';
    sparkle.style.animationDelay = (Math.random() * 3) + 's';
    sparkle.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
    landing.appendChild(sparkle);
  }
}

// ── Audio Setup ──────────────────────────────────────────
let ambientCtx = null;
let ambientGain = null;
let ambientOscillators = [];
let useWebAudio = false;
let mp3Available = null; // null = unknown, true = yes, false = no

function initAudio() {
  audioElement = document.getElementById('bg-music');
  if (!audioElement) return;

  audioElement.volume = 0.3;
  audioElement.loop = true;

  // Check if mp3 file exists by trying to fetch it
  fetch('music/romantic.mp3', { method: 'HEAD' })
    .then(res => {
      mp3Available = res.ok;
      if (!res.ok) {
        console.log('MP3 file not found — will use ambient fallback');
        useWebAudio = true;
      }
    })
    .catch(() => {
      // fetch fails for file:// protocol, try via audio element
      mp3Available = null;
    });

  // Also listen for error on the audio element itself
  audioElement.addEventListener('error', () => {
    mp3Available = false;
    useWebAudio = true;
  });
}

function createAmbientMusic() {
  if (ambientCtx) return; // Already created

  // Creates a soft, dreamy ambient soundscape using Web Audio API
  ambientCtx = new (window.AudioContext || window.webkitAudioContext)();

  // Master gain — start reasonably loud so user can hear it
  ambientGain = ambientCtx.createGain();
  ambientGain.gain.setValueAtTime(0.25, ambientCtx.currentTime);
  ambientGain.connect(ambientCtx.destination);

  // Romantic chord: C major 7th with extensions (dreamy pad)
  const frequencies = [261.63, 329.63, 392.00, 493.88, 523.25]; // C4, E4, G4, B4, C5

  frequencies.forEach((freq, i) => {
    const osc = ambientCtx.createOscillator();
    const oscGain = ambientCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ambientCtx.currentTime);

    // Gentle volume per voice
    oscGain.gain.setValueAtTime(0.07, ambientCtx.currentTime);

    // Slow tremolo for dreamy effect
    const lfo = ambientCtx.createOscillator();
    const lfoGain = ambientCtx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12 + i * 0.04, ambientCtx.currentTime);
    lfoGain.gain.setValueAtTime(0.018, ambientCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(oscGain.gain);
    lfo.start();

    osc.connect(oscGain);
    oscGain.connect(ambientGain);
    osc.start();

    ambientOscillators.push({ osc, oscGain, lfo, lfoGain });
  });

  // Add a second higher chord that fades in and out (chord movement)
  const highFreqs = [349.23, 440.00, 523.25, 659.25]; // F4, A4, C5, E5
  highFreqs.forEach((freq, i) => {
    const osc = ambientCtx.createOscillator();
    const oscGain = ambientCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ambientCtx.currentTime);
    oscGain.gain.setValueAtTime(0, ambientCtx.currentTime);

    // Slow swell: fade in over 4s, hold 3s, fade out over 4s, silence 3s, repeat
    const now = ambientCtx.currentTime;
    for (let j = 0; j < 30; j++) {
      const cycleStart = now + 2 + i * 0.5 + j * 14;
      oscGain.gain.setValueAtTime(0, cycleStart);
      oscGain.gain.linearRampToValueAtTime(0.05, cycleStart + 4);
      oscGain.gain.setValueAtTime(0.05, cycleStart + 7);
      oscGain.gain.linearRampToValueAtTime(0, cycleStart + 11);
    }

    osc.connect(oscGain);
    oscGain.connect(ambientGain);
    osc.start();

    ambientOscillators.push({ osc, oscGain });
  });
}

function startWebAudioFallback() {
  try {
    createAmbientMusic();
    useWebAudio = true;
    musicStarted = true;
    musicPlaying = true;
    updateMusicButton();
    console.log('🎵 Ambient music started via Web Audio API');
    return true;
  } catch (e) {
    console.log('Web Audio failed:', e);
    return false;
  }
}

function startMusic() {
  if (musicStarted) return;

  // If we already know mp3 is not available, go straight to Web Audio
  if (useWebAudio || mp3Available === false) {
    startWebAudioFallback();
    return;
  }

  // Try playing the mp3 with a timeout fallback
  if (audioElement) {
    musicStarted = true; // Prevent double-calls

    // Set a timeout — if mp3 doesn't start playing within 1.5s, use Web Audio
    const fallbackTimer = setTimeout(() => {
      if (!musicPlaying) {
        console.log('MP3 timed out — falling back to Web Audio');
        musicStarted = false;
        startWebAudioFallback();
      }
    }, 1500);

    const playPromise = audioElement.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        clearTimeout(fallbackTimer);
        musicPlaying = true;
        updateMusicButton();
        console.log('🎵 MP3 music started');
      }).catch(err => {
        clearTimeout(fallbackTimer);
        console.log('MP3 play failed:', err.message);
        musicStarted = false;
        startWebAudioFallback();
      });
    } else {
      // Old browser, playPromise is undefined
      clearTimeout(fallbackTimer);
      musicPlaying = true;
      updateMusicButton();
    }
  } else {
    // No audio element at all
    startWebAudioFallback();
  }
}

function toggleMusic() {
  if (!musicStarted) {
    startMusic();
    return;
  }

  if (musicPlaying) {
    if (useWebAudio && ambientCtx) {
      ambientCtx.suspend();
    } else if (audioElement) {
      audioElement.pause();
    }
    musicPlaying = false;
  } else {
    if (useWebAudio && ambientCtx) {
      ambientCtx.resume();
    } else if (audioElement) {
      audioElement.play();
    }
    musicPlaying = true;
  }
  updateMusicButton();
}

function updateMusicButton() {
  const btn = document.getElementById('music-btn');
  if (!btn) return;

  if (musicPlaying) {
    btn.textContent = '🎵';
    btn.classList.add('playing');
    btn.title = 'Music ON – Click to mute';
  } else {
    btn.textContent = '🔇';
    btn.classList.remove('playing');
    btn.title = 'Music OFF – Click to play';
  }
}

function initMusicToggle() {
  const btn = document.getElementById('music-btn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMusic();
    });
  }
}

// ── First Interaction (to enable audio on mobile) ────────
function initFirstInteraction() {
  const handler = () => {
    startMusic();
    document.removeEventListener('click', handler);
    document.removeEventListener('touchend', handler);
  };
  // Use 'touchend' instead of 'touchstart' for better mobile compatibility
  document.addEventListener('click', handler);
  document.addEventListener('touchend', handler);
}

// ── Start Experience ─────────────────────────────────────
function startExperience() {
  const landing = document.getElementById('landing-screen');
  const balloonScreen = document.getElementById('balloon-screen');

  // Start music immediately on the landing page click
  startMusic();

  landing.classList.add('hidden');

  setTimeout(() => {
    balloonScreen.classList.remove('hidden');
    createBalloons();
  }, 500);
}

// ── Create Balloons ──────────────────────────────────────
function createBalloons() {
  const arena = document.querySelector('.balloon-arena');
  const positions = calculateBalloonPositions();

  balloonData.forEach((data, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'balloon-wrapper';
    wrapper.style.left = positions[index].x + '%';
    wrapper.style.top = positions[index].y + '%';
    wrapper.style.animationDelay = (index * 0.4) + 's';
    wrapper.style.animationDuration = (5 + Math.random() * 3) + 's';
    wrapper.dataset.index = index;

    const body = document.createElement('div');
    body.className = 'balloon-body';
    body.style.backgroundColor = data.color;

    const emoji = document.createElement('span');
    emoji.className = 'balloon-emoji';
    emoji.textContent = data.emoji;

    const knot = document.createElement('div');
    knot.className = 'balloon-knot';
    knot.style.color = data.color;

    const string = document.createElement('div');
    string.className = 'balloon-string';
    string.style.animationDelay = (index * 0.2) + 's';

    body.appendChild(emoji);
    wrapper.appendChild(body);
    wrapper.appendChild(knot);
    wrapper.appendChild(string);

    wrapper.addEventListener('click', () => popBalloon(wrapper, index));

    // Entrance animation
    wrapper.style.opacity = '0';
    wrapper.style.transform = 'translateY(100px) scale(0.5)';
    setTimeout(() => {
      wrapper.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      wrapper.style.opacity = '1';
      wrapper.style.transform = 'translateY(0) scale(1)';
      // Remove the inline transition after entrance so float animation can take over
      setTimeout(() => {
        wrapper.style.transition = '';
        wrapper.style.transform = '';
        wrapper.style.opacity = '';
      }, 900);
    }, 300 + index * 200);

    arena.appendChild(wrapper);
  });
}

function calculateBalloonPositions() {
  const w = window.innerWidth;
  const isSmallMobile = w <= 480;
  const isMobile = w <= 768;

  if (isSmallMobile) {
    // 2 columns × 3 rows, centered nicely on small phones
    return [
      { x: 12, y: 18 },
      { x: 55, y: 18 },
      { x: 12, y: 40 },
      { x: 55, y: 40 },
      { x: 12, y: 62 },
      { x: 55, y: 62 },
    ];
  }

  if (isMobile) {
    // 2 columns × 3 rows, a bit more spread on tablets
    return [
      { x: 15, y: 16 },
      { x: 58, y: 16 },
      { x: 15, y: 38 },
      { x: 58, y: 38 },
      { x: 15, y: 60 },
      { x: 58, y: 60 },
    ];
  }

  // Desktop: spread across screen
  return [
    { x: 8, y: 25 },
    { x: 25, y: 45 },
    { x: 42, y: 20 },
    { x: 58, y: 50 },
    { x: 72, y: 28 },
    { x: 85, y: 48 },
  ];
}

// ── Pop Balloon ──────────────────────────────────────────
function popBalloon(wrapper, index) {
  if (wrapper.classList.contains('popping')) return;

  // Create pop particles
  createPopParticles(wrapper, balloonData[index].color);

  wrapper.classList.add('popping');

  // Small haptic-like sound effect via API
  playPopSound();

  setTimeout(() => {
    wrapper.style.display = 'none';
    poppedCount++;
    updateCounter();

    if (index === 5) {
      // FINAL BALLOON — show proposal
      showProposalScreen();
    } else {
      openPopup(index);
    }
  }, 500);
}

function createPopParticles(wrapper, color) {
  const rect = wrapper.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('div');
    particle.className = 'pop-particle';
    particle.style.position = 'fixed';
    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';
    particle.style.backgroundColor = color;
    particle.style.zIndex = '99';

    const angle = (i / 12) * Math.PI * 2;
    const dist = 40 + Math.random() * 60;
    particle.style.setProperty('--px', Math.cos(angle) * dist + 'px');
    particle.style.setProperty('--py', Math.sin(angle) * dist + 'px');
    particle.style.width = (4 + Math.random() * 6) + 'px';
    particle.style.height = particle.style.width;

    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 700);
  }
}

function playPopSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Silently ignore if AudioContext unavailable
  }
}

function updateCounter() {
  const counter = document.getElementById('popped-counter');
  if (counter) {
    counter.textContent = `${poppedCount} / ${balloonData.length} memories`;
  }
}

// ── Open Popup ───────────────────────────────────────────
function openPopup(index) {
  const overlay = document.getElementById('popup-overlay');
  const imgEl = document.getElementById('popup-image');
  const msgEl = document.getElementById('popup-message');

  const data = balloonData[index];

  // Try to load image; use placeholder if it fails
  imgEl.onerror = () => {
    imgEl.style.display = 'none';
    const placeholder = document.getElementById('popup-placeholder');
    placeholder.style.display = 'flex';
    placeholder.textContent = placeholderEmojis[index] || '💖';
  };
  imgEl.onload = () => {
    imgEl.style.display = 'block';
    document.getElementById('popup-placeholder').style.display = 'none';
  };
  imgEl.src = data.image;

  msgEl.textContent = data.message;
  overlay.classList.add('active');
}

function closePopup() {
  const overlay = document.getElementById('popup-overlay');
  overlay.classList.remove('active');
}

// ── Proposal Screen ──────────────────────────────────────
function showProposalScreen() {
  const balloonScreen = document.getElementById('balloon-screen');
  const proposalScreen = document.getElementById('proposal-screen');

  // Launch confetti
  launchConfetti();

  // Slightly increase music volume for emotional effect
  if (musicPlaying) {
    if (useWebAudio && ambientGain) {
      ambientGain.gain.linearRampToValueAtTime(0.35, ambientCtx.currentTime + 2);
    } else if (audioElement) {
      smoothVolumeChange(audioElement, 0.45, 2000);
    }
  }

  setTimeout(() => {
    balloonScreen.classList.add('hidden');
    proposalScreen.classList.remove('hidden');
  }, 800);
}

function smoothVolumeChange(audio, target, duration) {
  const start = audio.volume;
  const diff = target - start;
  const steps = 30;
  const stepTime = duration / steps;
  let step = 0;

  const interval = setInterval(() => {
    step++;
    audio.volume = Math.min(1, Math.max(0, start + (diff * (step / steps))));
    if (step >= steps) clearInterval(interval);
  }, stepTime);
}

// ── YES Click ────────────────────────────────────────────
function onYesClick() {
  const proposalScreen = document.getElementById('proposal-screen');
  const finalScreen = document.getElementById('final-screen');

  // Heart explosion!
  launchHeartExplosion();

  setTimeout(() => {
    proposalScreen.classList.add('hidden');
    finalScreen.classList.remove('hidden');

    // Continuous hearts in background
    startContinuousHearts();
  }, 1200);
}

// ── Confetti ─────────────────────────────────────────────
function launchConfetti() {
  const container = document.querySelector('.confetti-container');
  const colors = ['#ff4d6d', '#ff85a1', '#c77dff', '#e0aaff', '#ffb703', '#ff9ecb', '#d8b4fe', '#ff3d7f'];

  for (let i = 0; i < 100; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (2 + Math.random() * 3) + 's';
    piece.style.animationDelay = (Math.random() * 2) + 's';
    piece.style.width = (6 + Math.random() * 10) + 'px';
    piece.style.height = (6 + Math.random() * 10) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;

    container.appendChild(piece);
    setTimeout(() => piece.remove(), 5500);
  }
}

// ── Heart Explosion ──────────────────────────────────────
function launchHeartExplosion() {
  const container = document.querySelector('.heart-explosion');
  const hearts = ['❤️', '💖', '💗', '💕', '💜', '💝', '🌹'];

  for (let i = 0; i < 40; i++) {
    const heart = document.createElement('span');
    heart.className = 'explosion-heart';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = '50%';
    heart.style.top = '50%';
    heart.style.fontSize = (1 + Math.random() * 2) + 'rem';

    const angle = Math.random() * Math.PI * 2;
    const dist = 100 + Math.random() * 300;
    heart.style.setProperty('--ex', Math.cos(angle) * dist + 'px');
    heart.style.setProperty('--ey', Math.sin(angle) * dist + 'px');
    heart.style.animationDuration = (1 + Math.random() * 1.5) + 's';
    heart.style.animationDelay = (Math.random() * 0.5) + 's';

    container.appendChild(heart);
    setTimeout(() => heart.remove(), 3000);
  }
}

// ── Continuous Hearts (final screen) ─────────────────────
function startContinuousHearts() {
  const container = document.querySelector('.heart-explosion');
  const hearts = ['❤️', '💖', '💗', '💕', '💜'];

  setInterval(() => {
    for (let i = 0; i < 3; i++) {
      const heart = document.createElement('span');
      heart.className = 'explosion-heart';
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      heart.style.left = Math.random() * 100 + '%';
      heart.style.top = '110%';
      heart.style.fontSize = (1 + Math.random() * 1.5) + 'rem';

      heart.style.setProperty('--ex', (Math.random() * 100 - 50) + 'px');
      heart.style.setProperty('--ey', -(200 + Math.random() * 400) + 'px');
      heart.style.animationDuration = (2 + Math.random() * 2) + 's';

      container.appendChild(heart);
      setTimeout(() => heart.remove(), 4500);
    }
  }, 800);
}

// ── Close popup on overlay click ─────────────────────────
document.addEventListener('click', (e) => {
  if (e.target.id === 'popup-overlay') {
    closePopup();
  }
});

// ── Keyboard support ─────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePopup();
  }
});
