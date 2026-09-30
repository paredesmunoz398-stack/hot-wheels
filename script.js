// ==================== CONFIGURACIÓN DE ANILLOS Y VEHÍCULOS ====================
// Anillo 1 (Interior - Radio 190px)
const RING_1_VEHICLES = [
  { src: 'assets/car1_blue.png', width: 95 },
  { src: 'assets/moto1_opt.png', width: 75 },
  { src: 'assets/car_red.png', width: 95 },
  { src: 'assets/moto2_opt.png', width: 75 }
];

// Anillo 2 (Medio - Radio 310px)
const RING_2_VEHICLES = [
  { src: 'assets/car_green.png', width: 110 },
  { src: 'assets/moto3_flipped.png', width: 85 },
  { src: 'assets/car_yellow.png', width: 110 },
  { src: 'assets/car3_white.png', width: 100 },
  { src: 'assets/moto1_opt.png', width: 85 },
  { src: 'assets/car_cyan.png', width: 105 }
];

// Anillo 3 (Exterior - Radio 440px)
const RING_3_VEHICLES = [
  { src: 'assets/car2_gold.png', width: 125 },
  { src: 'assets/moto2_opt.png', width: 95 },
  { src: 'assets/car_purple.png', width: 120 },
  { src: 'assets/car4_flipped.png', width: 115 },
  { src: 'assets/moto1_opt.png', width: 95 },
  { src: 'assets/car5_flipped.png', width: 115 },
  { src: 'assets/car_blue_intro_opt.png', width: 125 },
  { src: 'assets/car1_blue.png', width: 120 }
];

// Elementos del DOM
const loaderScreen = document.getElementById('loader-screen');
const launchBtn = document.getElementById('launch-btn');
const trackProgress = document.getElementById('track-progress');
const runnerCar = document.getElementById('runner-car');
const loaderPercent = document.getElementById('loader-percent');
const loaderText = document.getElementById('loader-text');
const scene = document.getElementById('scene');
const bgAudio = document.getElementById('bg-audio');
const audioToggle = document.getElementById('audio-toggle');
const audioIcon = document.getElementById('audio-icon');
const vinylIcon = document.getElementById('vinyl-icon');

// ==================== PANTALLA DE CARGA CON CARRITO ====================
let isLoading = false;

launchBtn.addEventListener('click', startLoadingSequence);

function startLoadingSequence() {
  if (isLoading) return;
  isLoading = true;
  launchBtn.style.pointerEvents = 'none';
  launchBtn.style.opacity = '0.5';

  let progress = 0;
  const loadingInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 4) + 2;
    if (progress > 100) progress = 100;

    trackProgress.style.width = `${progress}%`;
    runnerCar.style.left = `${progress}%`;
    loaderPercent.textContent = `${progress}%`;

    if (progress < 25) {
      loaderText.textContent = 'Calentando motores...';
    } else if (progress < 60) {
      loaderText.textContent = 'Inyectando nitro azul...';
    } else if (progress < 90) {
      loaderText.textContent = 'Cargando órbita y planetas...';
    } else {
      loaderText.textContent = '¡POTENCIA MÁXIMA ALCANZADA!';
    }

    if (Math.random() > 0.4) {
      createRunnerSpark();
    }

    if (progress >= 100) {
      clearInterval(loadingInterval);
      setTimeout(finishLoadingAndLaunch, 400);
    }
  }, 45);
}

function createRunnerSpark() {
  const rect = runnerCar.getBoundingClientRect();
  const spark = document.createElement('div');
  spark.className = 'turbo-spark';
  spark.textContent = ['⚡', '✨', '💙'][Math.floor(Math.random() * 3)];
  spark.style.left = `${rect.left + 5}px`;
  spark.style.top = `${rect.top + (Math.random() * 20)}px`;
  document.body.appendChild(spark);
  setTimeout(() => spark.remove(), 800);
}

function finishLoadingAndLaunch() {
  runnerCar.style.transition = 'left 0.8s cubic-bezier(0.2, 1, 0.3, 1), transform 0.8s ease';
  runnerCar.style.left = '140%';
  runnerCar.style.transform = 'translate(-50%, -65%) scale(1.4)';

  // Iniciar canción Lana Del Rey - Born to Die
  bgAudio.volume = 0.85;
  bgAudio.play().catch(e => console.log('Audio autoplay:', e));

  setTimeout(() => {
    loaderScreen.classList.add('fade-out');
    scene.classList.remove('hidden');

    // Montar vehículos en los anillos orbitales y canvas
    buildPlanetaryRings();
    initSpaceCanvas();
  }, 650);
}

// ==================== CONSTRUCCIÓN DE ANILLOS ORBITALES 3D ====================
function buildPlanetaryRings() {
  setupOrbit('ring-1', RING_1_VEHICLES, 190);
  setupOrbit('ring-2', RING_2_VEHICLES, 310);
  setupOrbit('ring-3', RING_3_VEHICLES, 440);
}

function setupOrbit(ringId, vehicles, radius) {
  const ringEl = document.getElementById(ringId);
  ringEl.innerHTML = '';
  const total = vehicles.length;
  const angleStep = 360 / total;

  vehicles.forEach((v, index) => {
    const angle = index * angleStep;
    const vContainer = document.createElement('div');
    vContainer.className = 'orbit-vehicle';
    vContainer.style.width = `${v.width}px`;

    // Posicionamiento radial exacto tangente a la órbita y con contrarotación 3D
    vContainer.style.transform = `
      translate(-50%, -50%)
      rotate(${angle}deg)
      translateY(-${radius}px)
      rotate(90deg)
      rotateX(-68deg)
    `;

    const img = document.createElement('img');
    img.src = v.src;
    img.alt = 'Hot Wheels';
    vContainer.appendChild(img);

    // Interacción al tocar: acelera con corazones y nitro
    vContainer.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      createTurboHearts(e.clientX, e.clientY);
      img.style.filter = 'drop-shadow(0 0 30px #00f0ff) brightness(1.5)';
      setTimeout(() => {
        img.style.filter = '';
      }, 400);
    });

    ringEl.appendChild(vContainer);
  });
}

function createTurboHearts(x, y) {
  const icons = ['💙', '⚡', '🏎️', '🏍️', '✨', '🔥'];
  for (let i = 0; i < 6; i++) {
    const s = document.createElement('div');
    s.className = 'turbo-spark';
    s.textContent = icons[Math.floor(Math.random() * icons.length)];
    s.style.left = `${x + (Math.random() * 40 - 20)}px`;
    s.style.top = `${y + (Math.random() * 40 - 20)}px`;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }
}

// Toque en cualquier lugar genera chispitas
window.addEventListener('pointerdown', (e) => {
  if (e.target.closest('#launch-btn') || e.target.closest('.audio-control') || e.target.closest('.orbit-vehicle')) return;
  const spark = document.createElement('div');
  spark.className = 'turbo-spark';
  spark.textContent = '✨';
  spark.style.left = `${e.clientX}px`;
  spark.style.top = `${e.clientY}px`;
  document.body.appendChild(spark);
  setTimeout(() => spark.remove(), 800);
});

// ==================== CANVAS ESPACIO CÓSMICO Y ESTRELLAS ====================
function initSpaceCanvas() {
  const canvas = document.getElementById('space');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const stars = [];
  const starCount = Math.min(window.innerWidth < 600 ? 90 : 220, 250);

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      pulse: Math.random() * 0.03 + 0.01,
      color: Math.random() > 0.3 ? '#00f0ff' : '#ffffff'
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let s of stars) {
      s.alpha += s.pulse;
      if (s.alpha > 1 || s.alpha < 0.2) s.pulse = -s.pulse;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
      ctx.shadowBlur = 6;
      ctx.shadowColor = s.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(loop);
  }
  loop();
}

// ==================== CONTROL DE AUDIO ====================
audioToggle.addEventListener('click', () => {
  if (bgAudio.paused) {
    bgAudio.play();
    audioIcon.textContent = '⏸️';
    vinylIcon.classList.remove('paused');
  } else {
    bgAudio.pause();
    audioIcon.textContent = '▶️';
    vinylIcon.classList.add('paused');
  }
});
