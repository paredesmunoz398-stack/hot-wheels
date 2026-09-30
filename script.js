// ==================== RECURSOS Y CONFIGURACIÓN ====================
const CAR_IMAGES = [
  'assets/car1_blue.png',
  'assets/car2_gold.png',
  'assets/car3_white.png',
  'assets/car4_flipped.png',
  'assets/car5_flipped.png',
  'assets/car_blue_intro_opt.png'
];

// Elementos del DOM
const introScreen = document.getElementById('intro-screen');
const introBox = document.getElementById('intro-box');
const introCarContainer = document.getElementById('intro-car-container');
const startBtn = document.getElementById('start-btn');
const mainContent = document.getElementById('main-content');
const bgAudio = document.getElementById('bg-audio');
const musicToggleBtn = document.getElementById('music-toggle-btn');
const playIcon = document.getElementById('play-icon');
const vinylDisc = document.getElementById('vinyl-disc');
const equalizer = document.getElementById('equalizer');
const carsTrackZone = document.getElementById('cars-track-zone');
const openLetterBtn = document.getElementById('open-letter-btn');
const closeLetterBtn = document.getElementById('close-letter-btn');
const acceptLetterBtn = document.getElementById('accept-letter-btn');
const letterModal = document.getElementById('letter-modal');

// ==================== INTRO CON DESTELLO AZUL ====================
startBtn.addEventListener('click', () => {
  // 1. Iniciar música de Lana Del Rey inmediatamente (evita bloqueo del navegador)
  bgAudio.volume = 0.85;
  bgAudio.play().catch(err => console.log('Autoplay bloqueado:', err));

  // 2. Desvanecer cuadro de bienvenida
  introBox.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  introBox.style.opacity = '0';
  introBox.style.transform = 'scale(0.85)';

  // 3. Lanzar el bólido Hot Wheels azul con su estela de carga
  introCarContainer.classList.add('accelerate');

  // Generar chispas durante la acelerada
  const sparkInterval = setInterval(() => {
    createIntroSpark();
  }, 90);

  // 4. Tras el pase a toda velocidad, pasar a la página principal
  setTimeout(() => {
    clearInterval(sparkInterval);
    introScreen.classList.add('fade-out');
    mainContent.classList.remove('hidden');

    // Iniciar bucles de la pantalla principal
    initCarsFleet();
    initCanvasParticles();
  }, 1900);
});

function createIntroSpark() {
  const carRect = document.getElementById('intro-car').getBoundingClientRect();
  const spark = document.createElement('div');
  spark.className = 'turbo-spark';
  spark.textContent = ['⚡', '✨', '💙', '🔥'][Math.floor(Math.random() * 4)];
  spark.style.left = `${carRect.left + (Math.random() * 50)}px`;
  spark.style.top = `${carRect.top + (Math.random() * 40)}px`;
  document.body.appendChild(spark);
  setTimeout(() => spark.remove(), 900);
}

// ==================== FLOTA CONTINUA DE HOT WHEELS ====================
function initCarsFleet() {
  // Crear una tanda inicial de carritos
  for (let i = 0; i < 5; i++) {
    spawnMovingCar(true);
  }

  // Seguir creando carritos de forma periódica
  setInterval(() => {
    if (document.querySelectorAll('.moving-car').length < 8) {
      spawnMovingCar(false);
    }
  }, 2400);
}

function spawnMovingCar(isInitial = false) {
  const car = document.createElement('img');
  const imgSrc = CAR_IMAGES[Math.floor(Math.random() * CAR_IMAGES.length)];
  car.src = imgSrc;
  car.className = 'moving-car';

  // Dirección: 75% van de izquierda a derecha, 25% invertidos
  const goRight = !imgSrc.includes('flipped');
  const carWidth = Math.floor(Math.random() * 70) + 130; // 130px a 200px
  car.style.width = `${carWidth}px`;

  // Carril vertical (10% a 88% de la pantalla)
  const topPos = Math.floor(Math.random() * 78) + 10;
  car.style.top = `${topPos}%`;

  // Profundidad / escala
  const scale = (Math.random() * 0.4 + 0.7).toFixed(2);
  const opacity = (Math.random() * 0.3 + 0.7).toFixed(2);
  car.style.opacity = opacity;

  // Velocidad de recorrido (7s a 16s)
  const duration = Math.floor(Math.random() * 9) + 7;
  const startX = goRight ? -250 : window.innerWidth + 250;
  const endX = goRight ? window.innerWidth + 250 : -250;

  // Si es inicial, lo colocamos en medio de la pantalla
  let currentX = isInitial 
    ? Math.random() * (window.innerWidth - 100) 
    : startX;

  car.style.transform = `translateX(${currentX}px) scale(${scale})`;
  carsTrackZone.appendChild(car);

  // Animación suave de movimiento
  let startTime = performance.now();
  const totalDistance = endX - currentX;
  const speed = (endX - startX) / (duration * 1000);

  function animateCar(now) {
    const elapsed = now - startTime;
    const progressPos = currentX + (goRight ? (elapsed * speed) : -(elapsed * speed));

    const isDone = goRight ? (progressPos > endX) : (progressPos < endX);
    if (!isDone && car.isConnected) {
      car.style.transform = `translateX(${progressPos}px) scale(${scale})`;
      requestAnimationFrame(animateCar);
    } else {
      car.remove();
    }
  }
  requestAnimationFrame(animateCar);

  // Interactividad: al tocar un carrito, hace turbo
  car.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    car.style.filter = 'drop-shadow(0 0 30px #00f0ff) brightness(1.3)';
    createTurboBurst(e.clientX, e.clientY);
  });
}

function createTurboBurst(x, y) {
  const emojis = ['⚡', '💙', '🔥', '✨', '🏎️'];
  for (let i = 0; i < 5; i++) {
    const p = document.createElement('div');
    p.className = 'turbo-spark';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = `${x + (Math.random() * 40 - 20)}px`;
    p.style.top = `${y + (Math.random() * 40 - 20)}px`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

// ==================== CANVAS DE PARTÍCULAS ESPACIALES Y CÓDIGO ====================
function initCanvasParticles() {
  const canvas = document.getElementById('digital-canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const particles = [];
  const count = Math.min(window.innerWidth < 600 ? 55 : 120, 150);

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.8 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.7 + 0.3,
      color: Math.random() > 0.4 ? '#00f0ff' : '#0077ff'
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let p of particles) {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(loop);
  }
  loop();
}

// ==================== CONTROLES DE MÚSICA ====================
musicToggleBtn.addEventListener('click', () => {
  if (bgAudio.paused) {
    bgAudio.play();
    playIcon.textContent = '⏸️';
    vinylDisc.classList.remove('paused');
    equalizer.classList.remove('paused');
  } else {
    bgAudio.pause();
    playIcon.textContent = '▶️';
    vinylDisc.classList.add('paused');
    equalizer.classList.add('paused');
  }
});

// ==================== CARTA SECRETA MODAL ====================
openLetterBtn.addEventListener('click', () => {
  letterModal.classList.remove('hidden');
});

closeLetterBtn.addEventListener('click', () => {
  letterModal.classList.add('hidden');
});

acceptLetterBtn.addEventListener('click', (e) => {
  createTurboBurst(window.innerWidth / 2, window.innerHeight / 2);
  letterModal.classList.add('hidden');
});

letterModal.addEventListener('click', (e) => {
  if (e.target === letterModal) {
    letterModal.classList.add('hidden');
  }
});
