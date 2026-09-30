// ==================== CONFIGURACIÓN Y ASSETS ====================
const CARS_CONFIG = [
  { src: 'assets/car_green.png', x: '72%', y: '68%', w: 260, z: 12, rot: -8, depth: 1.15 },    // Superdeportivo verde esquina inferior derecha
  { src: 'assets/car_yellow.png', x: '5%', y: '74%', w: 230, z: 11, rot: 5, depth: 1.1 },      // Superdeportivo amarillo esquina inferior izquierda
  { src: 'assets/car3_white.png', x: '6%', y: '48%', w: 180, z: 9, rot: -4, depth: 0.95 },     // Deportivo blanco con rojo
  { src: 'assets/car1_blue.png', x: '78%', y: '28%', w: 190, z: 8, rot: 12, depth: 0.9 },      // Azul superior derecha
  { src: 'assets/car_red.png', x: '24%', y: '20%', w: 150, z: 7, rot: -6, depth: 0.8 },        // Rojo centro superior
  { src: 'assets/car_cyan.png', x: '46%', y: '16%', w: 140, z: 6, rot: 3, depth: 0.75 },       // Cyan al fondo
  { src: 'assets/car2_gold.png', x: '65%', y: '45%', w: 170, z: 8, rot: -10, depth: 0.88 },    // Dorado centro derecha
  { src: 'assets/car_purple.png', x: '28%', y: '58%', w: 160, z: 8, rot: 7, depth: 0.85 }      // Morado centro izquierda
];

// Elementos del DOM
const loaderScreen = document.getElementById('loader-screen');
const launchBtn = document.getElementById('launch-btn');
const trackProgress = document.getElementById('track-progress');
const runnerCar = document.getElementById('runner-car');
const loaderPercent = document.getElementById('loader-percent');
const loaderText = document.getElementById('loader-text');
const scene = document.getElementById('scene');
const carsContainer = document.getElementById('cars');
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

    // Actualizar barra y posición del carrito azul
    trackProgress.style.width = `${progress}%`;
    runnerCar.style.left = `${progress}%`;
    loaderPercent.textContent = `${progress}%`;

    // Cambiar texto de estado
    if (progress < 25) {
      loaderText.textContent = 'Calentando motores...';
    } else if (progress < 60) {
      loaderText.textContent = 'Inyectando nitro azul...';
    } else if (progress < 90) {
      loaderText.textContent = 'Cargando sorpresa especial...';
    } else {
      loaderText.textContent = '¡POTENCIA MÁXIMA ALCANZADA!';
    }

    // Chispas del escape durante la carga
    if (Math.random() > 0.4) {
      createRunnerSpark();
    }

    // Al llegar a 100%, ¡acelerón y transición a la escena!
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
  // Acelerón final del carrito fuera de pantalla
  runnerCar.style.transition = 'left 0.8s cubic-bezier(0.2, 1, 0.3, 1), transform 0.8s ease';
  runnerCar.style.left = '140%';
  runnerCar.style.transform = 'translate(-50%, -65%) scale(1.4)';

  // Iniciar canción Lana Del Rey - Born to Die
  bgAudio.volume = 0.85;
  bgAudio.play().catch(e => console.log('Audio autoplay:', e));

  setTimeout(() => {
    loaderScreen.classList.add('fade-out');
    scene.classList.remove('hidden');

    // Inicializar carritos en 3D y estrellas
    renderCarsInSpace();
    initSpaceCanvas();
  }, 650);
}

// ==================== DISPERSIÓN DE CARRITOS EN 3D (COMO EL MONITOR) ====================
function renderCarsInSpace() {
  carsContainer.innerHTML = '';

  CARS_CONFIG.forEach((cfg, idx) => {
    const carEl = document.createElement('div');
    carEl.className = 'space-car';
    carEl.style.left = cfg.x;
    carEl.style.top = cfg.y;
    carEl.style.zIndex = cfg.z;
    carEl.style.width = `${cfg.w}px`;
    carEl.style.transform = `rotate(${cfg.rot}deg) scale(${cfg.depth})`;

    const img = document.createElement('img');
    img.src = cfg.src;
    img.alt = 'Hot Wheels';
    carEl.appendChild(img);

    // Animación suave de suspensión/flotación
    const floatDuration = 4 + (idx % 3);
    const floatDelay = (idx * 0.4);
    carEl.style.animation = `floatCar ${floatDuration}s ease-in-out ${floatDelay}s infinite alternate`;

    // Interacción al tocar el auto: acelera y suelta corazones
    carEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      carEl.style.transform = `rotate(${cfg.rot - 4}deg) scale(${cfg.depth * 1.25})`;
      createTurboHearts(e.clientX, e.clientY);
      setTimeout(() => {
        carEl.style.transform = `rotate(${cfg.rot}deg) scale(${cfg.depth})`;
      }, 350);
    });

    carsContainer.appendChild(carEl);
  });

  // Agregar animación CSS dinámica para los autos
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes floatCar {
      0% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
      100% { transform: translateY(-10px) rotate(var(--rot, 0deg)); }
    }
  `;
  document.head.appendChild(style);
}

function createTurboHearts(x, y) {
  const icons = ['💙', '⚡', '🏎️', '✨', '🔥'];
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

// Click en cualquier parte del fondo genera un destello
window.addEventListener('pointerdown', (e) => {
  if (e.target.closest('#launch-btn') || e.target.closest('.audio-control')) return;
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
