// ==================== CONFIGURACIÓN DE VEHÍCULOS ====================
const VEHICLE_DATA = [
  // Anillo 1 (Radio: 135)
  { ring: 1, type: 'car', src: 'assets/car1_blue.png', w: 42, h: 22, speed: 0.016 },
  { ring: 1, type: 'moto', src: 'assets/moto1_opt.png', w: 30, h: 28, speed: 0.016 },
  { ring: 1, type: 'car', src: 'assets/car_red.png', w: 42, h: 22, speed: 0.016 },
  { ring: 1, type: 'moto', src: 'assets/moto2_opt.png', w: 30, h: 26, speed: 0.016 },

  // Anillo 2 (Radio: 220)
  { ring: 2, type: 'car', src: 'assets/car_green.png', w: 48, h: 25, speed: 0.010 },
  { ring: 2, type: 'moto', src: 'assets/moto3_flipped.png', w: 34, h: 30, speed: 0.010 },
  { ring: 2, type: 'car', src: 'assets/car_yellow.png', w: 48, h: 25, speed: 0.010 },
  { ring: 2, type: 'car', src: 'assets/car3_white.png', w: 44, h: 23, speed: 0.010 },
  { ring: 2, type: 'moto', src: 'assets/moto1_opt.png', w: 34, h: 30, speed: 0.010 },
  { ring: 2, type: 'car', src: 'assets/car_cyan.png', w: 46, h: 24, speed: 0.010 },

  // Anillo 3 (Radio: 310)
  { ring: 3, type: 'car', src: 'assets/car2_gold.png', w: 54, h: 28, speed: 0.007 },
  { ring: 3, type: 'moto', src: 'assets/moto2_opt.png', w: 38, h: 32, speed: 0.007 },
  { ring: 3, type: 'car', src: 'assets/car_purple.png', w: 52, h: 27, speed: 0.007 },
  { ring: 3, type: 'car', src: 'assets/car4_flipped.png', w: 50, h: 26, speed: 0.007 },
  { ring: 3, type: 'moto', src: 'assets/moto1_opt.png', w: 38, h: 32, speed: 0.007 },
  { ring: 3, type: 'car', src: 'assets/car5_flipped.png', w: 50, h: 26, speed: 0.007 },
  { ring: 3, type: 'car', src: 'assets/car_blue_intro_opt.png', w: 54, h: 28, speed: 0.007 },
  { ring: 3, type: 'car', src: 'assets/car1_blue.png', w: 52, h: 27, speed: 0.007 }
];

// Elementos del DOM
const loaderScreen = document.getElementById('loader-screen');
const launchBtn = document.getElementById('launch-btn');
const trackProgress = document.getElementById('track-progress');
const runnerCar = document.getElementById('runner-car');
const loaderPercent = document.getElementById('loader-percent');
const loaderText = document.getElementById('loader-text');
const uiLayer = document.getElementById('ui-layer');
const bgAudio = document.getElementById('bg-audio');
const audioToggle = document.getElementById('audio-toggle');
const audioIcon = document.getElementById('audio-icon');
const vinylIcon = document.getElementById('vinyl-icon');
const webglCanvas = document.getElementById('webgl-canvas');

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
      loaderText.textContent = 'Generando planeta y órbitas 3D...';
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
    uiLayer.classList.remove('hidden');

    // Inicializar el universo 3D completo con Three.js
    initThreeScene();
  }, 650);
}

// ==================== UNIVERSO 3D REAL (THREE.JS + CONTROLS) ====================
let scene3D, camera, renderer, controls;
let planetMesh, atmosphereMesh;
let orbitGroup;
let orbitingVehicles = [];
let raycaster, mouse;

function initThreeScene() {
  // 1. Escena y Cámara
  scene3D = new THREE.Scene();
  scene3D.fog = new THREE.FogExp2(0x010309, 0.0012);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 3000);
  camera.position.set(0, 260, 480);

  // 2. Renderizador WebGL
  renderer = new THREE.WebGLRenderer({ canvas: webglCanvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 3. Controles interactivos (¡El usuario puede moverse libremente!)
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;
  controls.minDistance = 140;
  controls.maxDistance = 850;
  controls.maxPolarAngle = Math.PI * 0.88;

  // 4. Luces para realismo 3D
  const ambientLight = new THREE.AmbientLight(0x224466, 1.4);
  scene3D.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
  sunLight.position.set(300, 200, 250);
  scene3D.add(sunLight);

  const blueGlowLight = new THREE.PointLight(0x00f0ff, 4, 400);
  blueGlowLight.position.set(0, 0, 0);
  scene3D.add(blueGlowLight);

  // 5. Planeta 3D Real (Venus / Planeta Cósmico con textura y atmósfera)
  createPlanet();

  // 6. Grupo de Anillos Orbitales Inclinados en 3D
  createOrbitSystem();

  // 7. Campo de estrellas en el fondo
  createStarfield();

  // 8. Raycaster para clics en carritos
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  window.addEventListener('resize', onWindowResize);
  webglCanvas.addEventListener('pointerdown', onScenePointerDown);

  // 9. Loop de renderizado
  animate();
}

function createPlanet() {
  const planetGeo = new THREE.SphereGeometry(62, 64, 64);
  const textureLoader = new THREE.TextureLoader();

  // Cargar textura de mapa de Venus
  const planetTex = textureLoader.load('assets/venus_map.jpg');
  planetTex.wrapS = THREE.RepeatWrapping;
  planetTex.wrapT = THREE.ClampToEdgeWrapping;

  const planetMat = new THREE.MeshStandardMaterial({
    map: planetTex,
    color: 0x66ccff,
    roughness: 0.75,
    metalness: 0.15,
    emissive: 0x002244,
    emissiveIntensity: 0.4
  });

  planetMesh = new THREE.Mesh(planetGeo, planetMat);
  scene3D.add(planetMesh);

  // Atmósfera brillante azul celeste
  const atmosGeo = new THREE.SphereGeometry(68, 48, 48);
  const atmosMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.28,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending
  });
  atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
  scene3D.add(atmosphereMesh);

  // Haz de luz vertical
  const beamGeo = new THREE.CylinderGeometry(1.5, 3.5, 350, 32);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending
  });
  const lightBeam = new THREE.Mesh(beamGeo, beamMat);
  lightBeam.position.set(0, 100, 0);
  scene3D.add(lightBeam);
}

function createOrbitSystem() {
  orbitGroup = new THREE.Group();
  // Inclinación dramática 3D tipo Saturno
  orbitGroup.rotation.x = Math.PI * 0.38;
  orbitGroup.rotation.z = -Math.PI * 0.08;
  scene3D.add(orbitGroup);

  const ringRadii = { 1: 135, 2: 220, 3: 310 };

  // Dibujar las 3 líneas de órbita brillantes
  [135, 220, 310].forEach(r => {
    const ringGeo = new THREE.RingGeometry(r - 0.75, r + 0.75, 128);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    orbitGroup.add(ringMesh);
  });

  // Cargar e instanciar cada carrito y moto como Sprite de alta fidelidad
  const texLoader = new THREE.TextureLoader();
  const loadedTextures = {};

  // Contar cuántos vehículos hay por anillo para repartirlos a 360°
  const counts = { 1: 0, 2: 0, 3: 0 };
  VEHICLE_DATA.forEach(v => counts[v.ring]++);

  const ringIndices = { 1: 0, 2: 0, 3: 0 };

  VEHICLE_DATA.forEach(data => {
    if (!loadedTextures[data.src]) {
      loadedTextures[data.src] = texLoader.load(data.src);
    }
    const texture = loadedTextures[data.src];

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: true
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(data.w, data.h, 1);

    const radius = ringRadii[data.ring];
    const totalInRing = counts[data.ring];
    const idx = ringIndices[data.ring]++;
    const initialAngle = (idx / totalInRing) * Math.PI * 2;

    orbitGroup.add(sprite);

    orbitingVehicles.push({
      sprite: sprite,
      radius: radius,
      angle: initialAngle,
      speed: data.speed,
      baseScaleW: data.w,
      baseScaleH: data.h
    });
  });
}

function createStarfield() {
  const starGeo = new THREE.BufferGeometry();
  const starCount = 1400;
  const posArray = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount * 3; i += 3) {
    posArray[i] = (Math.random() - 0.5) * 2000;
    posArray[i + 1] = (Math.random() - 0.5) * 2000;
    posArray[i + 2] = (Math.random() - 0.5) * 2000;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const starMat = new THREE.PointsMaterial({
    size: 2.2,
    color: 0x88eeff,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const stars = new THREE.Points(starGeo, starMat);
  scene3D.add(stars);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Interacción al tocar un carrito en el lienzo 3D
function onScenePointerDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const sprites = orbitingVehicles.map(v => v.sprite);
  const intersects = raycaster.intersectObjects(sprites);

  if (intersects.length > 0) {
    const hitSprite = intersects[0].object;
    const vObj = orbitingVehicles.find(v => v.sprite === hitSprite);
    if (vObj) {
      // Efecto turbo: agrandar momentáneamente
      vObj.sprite.scale.set(vObj.baseScaleW * 1.5, vObj.baseScaleH * 1.5, 1);
      setTimeout(() => {
        vObj.sprite.scale.set(vObj.baseScaleW, vObj.baseScaleH, 1);
      }, 400);

      // Desplegar chispas y corazones en la pantalla
      createTurboBurst(event.clientX, event.clientY);
    }
  }
}

function createTurboBurst(x, y) {
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

// ==================== BUCLE DE ANIMACIÓN 3D ====================
function animate() {
  requestAnimationFrame(animate);

  // 1. Rotación del Planeta sobre su eje
  if (planetMesh) {
    planetMesh.rotation.y += 0.0025;
  }
  if (atmosphereMesh) {
    atmosphereMesh.rotation.y += 0.0015;
  }

  // 2. Órbita continua de cada Carro y Moto alrededor del planeta
  orbitingVehicles.forEach(v => {
    v.angle += v.speed;

    // Posición circular exacta en el plano orbital
    v.sprite.position.x = Math.cos(v.angle) * v.radius;
    v.sprite.position.y = Math.sin(v.angle) * v.radius;
    // Leve flotación vertical armónica
    v.sprite.position.z = Math.sin(v.angle * 2) * 5;
  });

  // 3. Actualizar controles interactivos
  if (controls) {
    controls.update();
  }

  // 4. Renderizar escena
  renderer.render(scene3D, camera);
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
