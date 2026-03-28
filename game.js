/**
 * game.js
 * 3D Moon Rover - Physics, Cosmetics & HUD Update
 */

// --- Global Variables ---
let scene, camera, renderer;
let roverGroup, roverRadar;
let rocketGroup;
let obstacles = [];
let navArrow;
let collidableMeshes = [];
let roverSpotlight;
let roverPropeller;
let terrainMesh;
let rocketTexture, meteorTexture;
let collectedDebris = 0;
let totalDebris = 9; // 3 junk, 3 samples, 3 rocks
let landingEnviro = []; // Array to track space background items

// Physics / Movement
let velocityY = 0;
const gravity = 0.0005;
const jumpPower = 0.4;
let isGrounded = false;
let raycaster = new THREE.Raycaster();
let downVector = new THREE.Vector3(0, -1, 0);

// Game State
let isGameRunning = false;
let isTutorialCompleted = false;
let isQuizActive = false;
let activeObstacleIndex = 0;
let attemptsLeft = 3;
let username = "Kaşif";
let roverColor = "#ffffff";
let accessoryType = "none";
let score = 0;
let gameMode = 'rover'; // 'rover' or 'landing'
let fuel = 100;
let lives = 3;
let wrongAnswers = 0;
let landingRocket;
let meteors = [];
let targetLandingX = 0;
let targetLandingY = 0;
const keys = { w: false, a: false, s: false, d: false, space: false };

// HUD fade timer
let hudTimeout = null;

// UI Elements (Initialized in initUI)
let uiMenu, uiTutorial, uiQuizModal, uiResult, nameInput, colorInput, accessoryInput, warningUI;

function initUI() {
  uiMenu = document.getElementById("game-main-menu");
  uiTutorial = document.getElementById("game-tutorial");
  uiQuizModal = document.getElementById("quiz-modal");
  uiResult = document.getElementById("game-result-panel");
  nameInput = document.getElementById("playerName");
  colorInput = document.getElementById("roverColor");
  accessoryInput = document.getElementById("roverAccessory");
  warningUI = document.getElementById("ui-warning");
}

// initialization trigger
document.addEventListener("DOMContentLoaded", () => {
  initUI();
  initThreeJS();
  buildEnvironment();

  document.getElementById("start3DGameBtn").addEventListener("click", showTutorial);
  document.getElementById("skipTutorialBtn").addEventListener("click", startGame);
  document.getElementById("restartGameBtn").addEventListener("click", showMenu);

  // Hub buttons
  if (document.getElementById("startLandingBtn")) {
    document.getElementById("startLandingBtn").addEventListener("click", startGame);
  }

  window.addEventListener("keydown", (e) => handleKey(e.key.toLowerCase(), true));
  window.addEventListener("keyup", (e) => handleKey(e.key.toLowerCase(), false));

  // Handle Arrow Keys separately for compatibility
  window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.key)) {
      e.preventDefault();
      handleKey(e.key.toLowerCase(), true);
    }
  });
  window.addEventListener("keyup", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.key)) {
      handleKey(e.key.toLowerCase(), false);
    }
  });

  window.addEventListener("resize", onWindowResize, false);

  window.addEventListener("mousemove", (e) => {
    if (gameMode === 'landing' && isGameRunning && !isQuizActive) {
      let nX = (e.clientX / window.innerWidth) * 2 - 1;
      let nY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetLandingX = nX * 70; // Map screen ratio to X movement range
      targetLandingY = nY * 40; // Map screen ratio to Y movement range
    }
  });

  animate();
});

// --- UI & Robot Dialog Flow ---

function showQuizModal(message, showOptions = false) {
  uiQuizModal.style.display = "flex";

  const textEl = document.getElementById("dialog-text");
  const optionsEl = document.getElementById("dialog-options");
  const nextBtn = document.getElementById("dialog-next-btn");

  textEl.innerText = message;

  if (showOptions) {
    optionsEl.style.display = "grid";
    nextBtn.style.display = "none";
  } else {
    optionsEl.style.display = "none";
    optionsEl.innerHTML = "";
  }
}

function showMenu() {
  isGameRunning = false;
  uiMenu.style.display = "block";
  uiTutorial.style.display = "none";
  uiQuizModal.style.display = "none";
  uiResult.style.display = "none";

  if (roverGroup) {
    roverGroup.position.set(0, 5, 0); // start a bit high
    roverGroup.rotation.set(0, 0, 0);
  }
}

function showTutorial() {
  username = nameInput.value.trim() || "Kaşif";
  roverColor = colorInput.value;
  accessoryType = accessoryInput ? accessoryInput.value : "none";

  // Rebuild rover to apply accessory
  if (roverGroup) {
    scene.remove(roverGroup);
    if (navArrow) scene.remove(navArrow);
  }
  createRover();

  // Removed AI name assignment

  uiMenu.style.display = "none";
  uiTutorial.style.display = "block";
}

function startGame() {
  uiTutorial.style.display = "none";
  uiResult.style.display = "none";
  document.getElementById("landing-game-menu").style.display = "none";

  // Reset Common State
  attemptsLeft = 3;
  wrongAnswers = 0;
  lives = 3;
  fuel = 100;
  collectedDebris = 0;
  isGameRunning = true;
  isQuizActive = false;

  // Clear scene of game objects
  clearGameObjects();

  if (gameMode === 'rover') {
    activeObstacleIndex = 0;
    buildRoverWorld();
    if (uiMenu) uiMenu.style.display = "none";
    document.getElementById("gameplay-hud").style.display = "block";
    document.getElementById("landing-hud").style.display = "none";
    updateProgressBar();
  } else {
    activeObstacleIndex = 0;
    buildLandingWorld();
    if (uiMenu) uiMenu.style.display = "none";
    document.getElementById("gameplay-hud").style.display = "none";
    document.getElementById("landing-hud").style.display = "block";
    updateLandingHUD();
  }

  // Force renderer resize because it might have initialized at 0x0
  const container = document.getElementById("game-canvas-container");
  if (renderer && container) {
    const rect = container.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }
}

function clearGameObjects() {
  obstacles.forEach(o => scene.remove(o));
  obstacles = [];
  if (roverGroup) scene.remove(roverGroup);
  if (rocketGroup) scene.remove(rocketGroup);
  if (terrainMesh) {
    scene.remove(terrainMesh);
    terrainMesh = null;
  }
  if (navArrow) scene.remove(navArrow);
  if (landingRocket) scene.remove(landingRocket);
  meteors.forEach(m => scene.remove(m));
  meteors = [];
  landingEnviro.forEach(e => scene.remove(e));
  landingEnviro = [];

  // Clear Minimap Dots
  const dots = document.querySelectorAll(".debris-dot");
  dots.forEach(d => d.remove());
}

function buildRoverWorld() {
  if (scene) scene.fog = new THREE.FogExp2(0x050511, 0.0035);

  if (accessoryInput) accessoryType = accessoryInput.value;
  if (colorInput) roverColor = colorInput.value;

  createGround();
  createRocket();
  generateObstaclesAndPath();
  createRover();
}

function buildLandingWorld() {
  // Basic landing setup: Big Moon at distance, particles
  createLandingScene();
}

function selectGame(mode) {
  gameMode = mode;
  document.getElementById('game-hub-menu').style.display = 'none';
  if (mode === 'rover') {
    document.getElementById('game-main-menu').style.display = 'block';
  } else {
    document.getElementById('landing-game-menu').style.display = 'block';
  }
}
window.selectGame = selectGame; // Override main.js version to sync state

function backToHub() {
  isGameRunning = false;
  document.getElementById('game-main-menu').style.display = 'none';
  document.getElementById('landing-game-menu').style.display = 'none';
  document.getElementById('game-hub-menu').style.display = 'block';
}
window.backToHub = backToHub;

function endGame(won) {
  isGameRunning = false;
  uiQuizModal.style.display = "none";
  document.getElementById("gameplay-hud").style.display = "none";
  document.getElementById("landing-hud").style.display = "none";
  uiResult.style.display = "block";

  const heading = document.getElementById("result-heading");
  const desc = document.getElementById("result-description");

  if (won) {
    heading.innerText = "Görev Tamamlandı!";
    heading.style.color = "var(--color-success, #4CAF50)";

    if (gameMode === 'rover') {
      desc.innerText = `Harika iş çıkardın ${username}! Tüm parçaları başarıyla topladın ve rokete yetiştin.`;
    } else {
      desc.innerText = `Muhteşem iniş! Moncuk'u başarıyla kurtardın. Moncuk şu an çok mutlu! 🧸✨`;
    }

    velocityY = 1.0; // victory jump

    // Scoring
    let puan = (gameMode === 'rover') ? (collectedDebris * 100) : (lives * 500 + Math.floor(fuel) * 10);
    if (window.skorKaydet) {
      window.skorKaydet(username, puan);
    }

  } else {
    heading.innerText = "Görev Başarısız!";
    heading.style.color = "var(--color-error, #f44336)";

    if (gameMode === 'rover') {
      desc.innerText = `Görev başarısız ${username}. Tüm parçaları toplayıp sistemi onaramadın. Lütfen tekrar dene.`;
    } else {
      desc.innerText = lives <= 0 ? "Çok fazla çarpışma! Roket parçalandı." : "Sistem hatası. Moncuk kurtarılamadı.";
    }
  }
}

// --- Three.js Setup & Graphics ---

function initThreeJS() {
  const container = document.getElementById("game-canvas-container");
  if (!container) {
    console.error("Game container not found!");
    return;
  }

  // Initialize Texture Loading here
  const textureLoader = new THREE.TextureLoader();
  rocketTexture = textureLoader.load('rocket.png');
  meteorTexture = textureLoader.load('meteor.png');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050511); // deep blue-black space
  scene.fog = new THREE.FogExp2(0x050511, 0.0035); // Moodier fog

  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 3000);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better shadows
  container.appendChild(renderer.domElement);

  // Lighting - Moodier realistic lighting with neon pops
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // low ambient
  scene.add(ambientLight);

  const moonLight = new THREE.DirectionalLight(0xb0c4de, 0.8); // slight blueish moonlight
  moonLight.position.set(200, 300, -200);
  moonLight.castShadow = true;
  moonLight.shadow.camera.left = -500;
  moonLight.shadow.camera.right = 500;
  moonLight.shadow.camera.top = 500;
  moonLight.shadow.camera.bottom = -500;
  moonLight.shadow.mapSize.width = 4096;
  moonLight.shadow.mapSize.height = 4096;
  moonLight.shadow.bias = -0.001;
  scene.add(moonLight);

  // Distant galaxy glow to make things colorful
  const galaxyHemiLight = new THREE.HemisphereLight(0xffaaff, 0x050511, 0.2);
  scene.add(galaxyHemiLight);
}

function onWindowResize() {
  const container = document.getElementById("game-canvas-container");
  if (container && camera && renderer) {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
}

// Procedural Bump Map
function createBumpTexture() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(size, size);
  for (let i = 0; i < imgData.data.length; i += 4) {
    let noise = Math.floor(Math.random() * 255);
    imgData.data[i] = noise;
    imgData.data[i + 1] = noise;
    imgData.data[i + 2] = noise;
    imgData.data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(150, 450);
  return texture;
}

// --- World Building ---

function buildEnvironment() {
  createStars();
  createGround();
  createRocket(); // Needs to be generated so we have the array initialized
  generateObstaclesAndPath(); // Wait, rover needs navArrow later, so it's fine.
  createRover();
}

function createStars() {
  const starGeo = new THREE.BufferGeometry();
  const starMats = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8 });

  const starVertices = [];
  for (let i = 0; i < 8000; i++) {
    const x = (Math.random() - 0.5) * 3000;
    const y = Math.random() * 1000 + 50;
    const z = (Math.random() - 0.5) * 4000;
    starVertices.push(x, y, z);
  }

  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  scene.add(new THREE.Points(starGeo, starMats));
}

function createGround() {
  const bumpTex = createBumpTexture();
  const groundGeo = new THREE.PlaneGeometry(1500, 4000, 200, 400);

  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x4a4a4a, // slightly brighter moon
    roughness: 0.8,
    bumpMap: bumpTex,
    bumpScale: 0.8
  });

  terrainMesh = new THREE.Mesh(groundGeo, groundMat);
  terrainMesh.rotation.x = -Math.PI / 2;
  terrainMesh.receiveShadow = true;

  // Perturb vertices to create mountains and hills
  const pos = terrainMesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let z = pos.getZ(i);
    let x = pos.getX(i);
    let yMap = pos.getY(i);

    // Large mountains towards the edges
    let edgeFactor = Math.abs(x) / 750;
    let baseH = Math.pow(edgeFactor, 3) * 60;

    // Rolling hills
    z += baseH + Math.sin(x * 0.015) * Math.cos(yMap * 0.015) * 12;
    // Small craters/bumps
    z += Math.cos(x * 0.05 + yMap * 0.05) * 2;

    pos.setZ(i, z);
  }
  terrainMesh.geometry.computeVertexNormals();
  scene.add(terrainMesh);
}

// --- Cosmetic System ---
function buildAccessories(body) {
  if (accessoryType === "none") return;

  const accGroup = new THREE.Group();

  if (accessoryType === "cowboy") {
    // Hat brim
    const brim = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.4, 8, 24), new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
    brim.rotation.x = Math.PI / 2;
    // Hat top
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 1.5, 16), new THREE.MeshStandardMaterial({ color: 0xA0522D }));
    top.position.y = 0.8;

    accGroup.add(brim, top);
    accGroup.position.set(0, 3, 0); // Put on top of chassis
    accGroup.rotation.x = -0.1;

  } else if (accessoryType === "cow") {
    // Modify body color
    body.material.color.setHex(0xffffff);
    // Let's add spots (using small dark cylinders over the body)
    for (let i = 0; i < 5; i++) {
      let spot = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 4.2, 8), new THREE.MeshBasicMaterial({ color: 0x222222 }));
      spot.rotation.x = Math.PI / 2;
      spot.position.set((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2);
      accGroup.add(spot);
    }
    // Horns
    const hornGeo = new THREE.ConeGeometry(0.3, 1, 8);
    const hornMat = new THREE.MeshStandardMaterial({ color: 0xffffdd });
    const h1 = new THREE.Mesh(hornGeo, hornMat); h1.position.set(1, 4, -1); h1.rotation.z = -0.3;
    const h2 = new THREE.Mesh(hornGeo, hornMat); h2.position.set(-1, 4, -1); h2.rotation.z = 0.3;
    // Nose
    const nose = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), new THREE.MeshStandardMaterial({ color: 0xff88aa }));
    nose.position.set(0, 1.6, -2.5);
    nose.scale.set(1.5, 0.5, 0.5);

    accGroup.add(h1, h2, nose);

  } else if (accessoryType === "astronaut") {
    // White Helmet
    const helm = new THREE.Mesh(new THREE.SphereGeometry(1.8, 32, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.1 }));
    // Gold Visor
    const visor = new THREE.Mesh(new THREE.SphereGeometry(1.6, 32, 32, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.1 }));
    visor.rotation.x = -Math.PI / 2;
    visor.rotation.z = Math.PI;
    visor.position.z = -0.3;
    visor.position.y = 0.2;

    accGroup.add(helm, visor);
    accGroup.position.set(0, 4, 0);
  }

  return accGroup;
}

function createRover() {
  roverGroup = new THREE.Group();

  // Main Chassis (modern angled look)
  const chassisGeo = new THREE.CylinderGeometry(1.8, 2.2, 4, 6);
  chassisGeo.rotateX(Math.PI / 2);
  const chassisMat = new THREE.MeshStandardMaterial({ color: roverColor, roughness: 0.5 });
  const chassis = new THREE.Mesh(chassisGeo, chassisMat);
  chassis.position.y = 1.6;
  chassis.castShadow = true;
  chassis.userData.isBody = true;
  roverGroup.add(chassis);

  // Apply cosmetics
  const acc = buildAccessories(chassis);
  if (acc) roverGroup.add(acc);

  // Solar panel wing (hide if astronaut because helmet clips)
  if (accessoryType !== "astronaut") {
    const panelGeo = new THREE.BoxGeometry(6, 0.1, 2);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x112255, metalness: 0.8, roughness: 0.2 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 2.8, 0.5);
    panel.castShadow = true;
    roverGroup.add(panel);
  }

  // Suspension & Wheels (more detailed)
  const wheelGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.6, 16);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, bumpMap: createBumpTexture(), bumpScale: 0.2 });

  const wheelPositions = [
    [-2.2, 0.9, 1.5], [2.2, 0.9, 1.5],
    [-2.2, 0.9, -1.5], [2.2, 0.9, -1.5],
    [-2.2, 0.9, 0], [2.2, 0.9, 0] // 6 wheels
  ];

  wheelPositions.forEach(pos => {
    // suspension arm
    const armGeo = new THREE.BoxGeometry(1, 0.2, 0.2);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(pos[0] * 0.7, 1.4, pos[2]);
    arm.rotation.z = pos[0] > 0 ? Math.PI / 4 : -Math.PI / 4;
    roverGroup.add(arm);

    // wheel
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(...pos);
    wheel.castShadow = true;
    roverGroup.add(wheel);
  });

  // Animated Radar / Sensor Array
  const radarGroup = new THREE.Group();
  const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.5);
  const dishGeo = new THREE.CylinderGeometry(0.8, 0.5, 0.2, 16);
  const pole = new THREE.Mesh(poleGeo, new THREE.MeshStandardMaterial({ color: 0x888888 }));
  const dish = new THREE.Mesh(dishGeo, new THREE.MeshStandardMaterial({ color: 0xdddddd }));
  pole.position.y = 0.75;
  dish.position.set(0, 1.5, 0.2);
  dish.rotation.x = Math.PI / 3;
  radarGroup.add(pole);
  radarGroup.add(dish);
  radarGroup.position.set(-1, 2.8, 1);
  roverGroup.add(radarGroup);
  roverRadar = radarGroup; // save ref for animation

  // Headlights (Spotlights)
  roverSpotlight = new THREE.SpotLight(0xffffee, 2, 80, Math.PI / 4, 0.5, 1);
  roverSpotlight.position.set(0, 2, -2);
  roverSpotlight.target.position.set(0, 0, -10);
  roverSpotlight.castShadow = true;
  roverGroup.add(roverSpotlight);
  roverGroup.add(roverSpotlight.target);

  roverGroup.position.set(0, 5, 0);
  scene.add(roverGroup);

  // Navigation Arrow above rover
  if (!navArrow) {
    const arrowGeo = new THREE.ConeGeometry(0.8, 2, 8);
    arrowGeo.rotateX(Math.PI / 2); // default pointing forward (-Z)
    const arrowMat = new THREE.MeshLambertMaterial({ color: 0x00ffff, emissive: 0x005555 });
    navArrow = new THREE.Mesh(arrowGeo, arrowMat);
    scene.add(navArrow);
  }
}

function createRocket() {
  rocketGroup = new THREE.Group();

  const baseGeo = new THREE.CylinderGeometry(3, 4, 15, 32);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.3 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 7.5;
  base.castShadow = true;
  rocketGroup.add(base);

  const noseGeo = new THREE.ConeGeometry(3, 6, 32);
  const noseMat = new THREE.MeshStandardMaterial({ color: 0xcc2222 });
  const nose = new THREE.Mesh(noseGeo, noseMat);
  nose.position.y = 18;
  nose.castShadow = true;
  rocketGroup.add(nose);

  const finGeo = new THREE.BoxGeometry(0.5, 5, 4);
  const finMat = new THREE.MeshStandardMaterial({ color: 0xcc2222 });
  for (let i = 0; i < 4; i++) {
    const fin = new THREE.Mesh(finGeo, finMat);
    fin.position.y = 2.5;
    fin.position.x = Math.cos(i * Math.PI / 2) * 3.5;
    fin.position.z = Math.sin(i * Math.PI / 2) * 3.5;
    fin.rotation.y = -i * Math.PI / 2;
    rocketGroup.add(fin);
  }

  // Placed at terrain height
  let terrainY = 0;
  if (terrainMesh) {
    raycaster.set(new THREE.Vector3(0, 500, -1800), downVector);
    const intersects = raycaster.intersectObject(terrainMesh);
    if (intersects.length > 0) terrainY = intersects[0].point.y;
  }
  rocketGroup.position.set(0, (terrainY - 0), -1800);
  scene.add(rocketGroup);
}


// --- Landing Mission Objects ---

function createLandingScene() {
  if (scene) scene.fog = null; // Uzay boslugu icin sisi tamamen kaldir

  const landingLight = new THREE.AmbientLight(0xffffff, 0.8); // Ortami aydinlat
  scene.add(landingLight);
  landingEnviro.push(landingLight);

  // Clear any existing stars if necessary
  const starGeo = new THREE.BufferGeometry();
  const starPos = [];
  for (let i = 0; i < 3000; i++) {
    starPos.push((Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);
  landingEnviro.push(stars);

  // Rocket Setup
  const rocketMat = new THREE.SpriteMaterial({ map: rocketTexture });
  landingRocket = new THREE.Sprite(rocketMat);
  landingRocket.scale.set(6, 12, 1);
  landingRocket.position.set(0, 0, 0);
  scene.add(landingRocket);

  // Distant Moon
  const moonGeo = new THREE.SphereGeometry(200, 64, 64);
  // Gri Ay talebi için MeshBasicMaterial ile parlak gri ()
  const moonMat = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
  const bigMoon = new THREE.Mesh(moonGeo, moonMat);
  bigMoon.position.z = -2000;
  scene.add(bigMoon);
  landingEnviro.push(bigMoon);

  // Moncuk Bear on the Moon
  createMoncuk(-10, -1800);
}

function updateMinimap() {
  const roverDot = document.getElementById("minimap-rover");
  if (roverDot && roverGroup) {
    // Current terrain is 1500x4000
    let mapX = (roverGroup.position.x + 750) / 15;
    let mapY = (roverGroup.position.z + 2000) / 40;
    mapY = Math.max(0, Math.min(100, mapY));
    mapX = Math.max(0, Math.min(100, mapX));
    roverDot.style.top = `${mapY}%`;
    roverDot.style.left = `${mapX}%`;
  }
}

function createMoncuk(x, z) {
  const bearGroup = new THREE.Group();
  const bearMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown

  // Body
  const body = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 16), bearMat);
  body.position.y = 2;
  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 16), bearMat);
  head.position.y = 4.5;
  // Ears
  const earGeo = new THREE.SphereGeometry(0.5, 8, 8);
  const ear1 = new THREE.Mesh(earGeo, bearMat); ear1.position.set(0.8, 5.5, 0.5);
  const ear2 = new THREE.Mesh(earGeo, bearMat); ear2.position.set(-0.8, 5.5, 0.5);

  bearGroup.add(body, head, ear1, ear2);

  // Speech Bubble (Visual)
  const bubbleGeo = new THREE.BoxGeometry(4, 2, 0.1);
  const bubbleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
  bubble.position.set(4, 7, 0);
  bearGroup.add(bubble);

  // Get terrain height at landing zone (approximate for landing world)
  bearGroup.position.set(x, 0, z);
  scene.add(bearGroup);
  landingEnviro.push(bearGroup);

  // Animate waving in loop?
  bearGroup.userData = { isMoncuk: true };
}

function spawnMeteor() {
  if (gameMode !== 'landing') return;

  // Rastgele Engeller ve Asteroitler
  if (Math.random() < 0.1) {
    // Asteroit (Sprite)
    const material = new THREE.SpriteMaterial({
      map: meteorTexture,
      color: 0xffffff
    });
    const meteor = new THREE.Sprite(material);
    const size = 15 + Math.random() * 25;
    meteor.scale.set(size, size, 1);
    meteor.position.set(
      landingRocket.position.x + (Math.random() - 0.5) * 200,
      landingRocket.position.y + (Math.random() - 0.5) * 200,
      landingRocket.position.z - 1000
    );
    scene.add(meteor);
    meteors.push(meteor);
  } else {
    // Uzay Çöpü / Engel (3D Mesh)
    // 1. Texture Loader oluştur
    const loader = new THREE.TextureLoader();

    // 2. Resim dosyasını yükle (path/to/your/texture.jpg kısmını kendi dosyanla değiştir)
    const moonTexture = loader.load('meteor.png');

    // 3. Materyali oluştur ve 'map' özelliğine ata
    const mat = new THREE.MeshStandardMaterial({
      map: moonTexture,           // Ana renk dokusu
      emissive: 0xffffff,         // Hala hafif bir ışıma istersen kalabilir
      roughness: 0.95,             // Ay yüzeyi mat olduğu için yüksek tut
      metalness: 0.05              // Ay toprağı metalik değildir
    });
    const geo = new THREE.DodecahedronGeometry(5 + Math.random() * 5, 0); // sivri engeller
    const junk = new THREE.Mesh(geo, mat);
    junk.rotation.set(Math.random(), Math.random(), Math.random());
    junk.position.set(
      landingRocket.position.x + (Math.random() - 0.5) * 200,
      landingRocket.position.y + (Math.random() - 0.5) * 200,
      landingRocket.position.z - 1000
    );
    scene.add(junk);
    meteors.push(junk);
  }
}

// --- Collectible Objects (3 Junk, 3 Samples, 3 Rocks) ---

function createSpaceJunk(x, z) {
  const grp = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, emissive: 0x111111 }));
  const panel = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 1.5), new THREE.MeshStandardMaterial({ color: 0x2244aa, metalness: 0.9 }));
  panel.position.set(1.5, 0.5, 0);
  panel.rotation.z = Math.PI / 6;
  grp.add(body, panel);

  grp.rotation.set(Math.random(), Math.random(), Math.random());
  grp.position.set(x, 0, z); // Initial 0, will be Box3 adjusted
  grp.traverse(c => { if (c.isMesh) c.castShadow = true; });

  return { mesh: grp, mat: body.material, originalColor: 0x888888, type: "Uzay Çöpü" };
}

function createMoonSample(x, z) {
  const grp = new THREE.Group();
  // Safe container box
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 0.8, 8), new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 }));
  base.position.y = 0.4;
  // Glowing blue core
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.8), new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x008888, transparent: true, opacity: 0.9 }));
  core.position.y = 1.5;
  grp.add(base, core);

  grp.position.set(x, 0, z);
  grp.traverse(c => { if (c.isMesh) c.castShadow = true; });
  return { mesh: grp, mat: core.material, originalColor: 0x00ffff, type: "Araştırma Numunesi" };
}

function createMoonRock(x, z) {
  const geo = new THREE.DodecahedronGeometry(Math.random() * 1.5 + 2.5, 1);
  const mat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 1.0, flatShading: true, emissive: 0x111111 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.set(Math.random(), Math.random(), Math.random());
  mesh.position.set(x, 0, z);
  mesh.castShadow = true;
  return { mesh, mat, originalColor: 0x777777, type: "Nadir Ay Taşı" };
}

function generateObstaclesAndPath() {
  const numCheckpoints = 9;
  const distInterval = 1800 / numCheckpoints;

  // Create exactly 3 of each, shuffle them
  let types = [
    'junk', 'junk', 'junk',
    'sample', 'sample', 'sample',
    'rock', 'rock', 'rock'
  ];
  types.sort(() => Math.random() - 0.5); // shuffle

  // Ensure terrain world matrix is updated before raycasting
  if (terrainMesh) terrainMesh.updateMatrixWorld(true);

  for (let i = 1; i <= numCheckpoints; i++) {
    const zPos = -distInterval * i;
    const xPos = -100 + Math.random() * 200; // Sabit zig-zag (rastgele değil)

    const typeStr = types[i - 1];
    let objData;

    if (typeStr === 'junk') objData = createSpaceJunk(xPos, zPos);
    else if (typeStr === 'sample') objData = createMoonSample(xPos, zPos);
    else objData = createMoonRock(xPos, zPos);

    // PERFECT TERRAIN HEIGHT PLACEMENT
    let terrainY = 0;
    if (terrainMesh) {
      const origin = new THREE.Vector3(xPos, 500, zPos);
      raycaster.set(origin, downVector);
      const intersects = raycaster.intersectObject(terrainMesh);
      if (intersects.length > 0) terrainY = intersects[0].point.y;
    }

    // Ensure the mesh knows its world rotation/position before Box3
    objData.mesh.updateMatrixWorld(true);

    // Compute exact bottom of the mesh using Box3
    const bbox = new THREE.Box3().setFromObject(objData.mesh);
    const bottomY = bbox.min.y;
    // Shift up so the bottom perfectly matches terrainY
    objData.mesh.position.y += (terrainY - bottomY);

    // Create Minimap Dot
    const dot = document.createElement("div");
    dot.className = "minimap-dot debris-dot";

    // Map bounds: Z goes from 0 to -1800 (y-axis on map 90% to 10%)
    // X goes from -200 to 200 (x-axis on map 10% to 90%)
    const mapY = 90 - (Math.abs(zPos) / 1800) * 80;
    const mapX = 50 + (xPos / 200) * 40;
    dot.style.top = `${mapY}%`;
    dot.style.left = `${mapX}%`;
    document.getElementById("minimap-grid").appendChild(dot);

    // Indicator Arrow above Debris
    const indGeo = new THREE.ConeGeometry(0.5, 1.5, 4);
    indGeo.rotateX(Math.PI); // Point down
    const indMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const indicator = new THREE.Mesh(indGeo, indMat);
    indicator.position.set(0, 5, 0); // Above the debris
    objData.mesh.add(indicator);

    objData.mesh.userData = {
      isObstacle: true,
      solved: false,
      type: objData.type,
      materialRef: objData.mat,
      originalColor: objData.originalColor,
      minimapDot: dot,
      indicator: indicator
    };

    scene.add(objData.mesh);
    obstacles.push(objData.mesh);
  }
}

function updateProgressBar() {
  const progressText = document.getElementById("progress-text");
  const progressTextObs = document.getElementById("progress-text-obs");
  const progressFill = document.getElementById("progress-fill");

  let numune = 0;
  let cop = 0;
  let kaya = 0;

  // Sadece toplanan (solved = true) parçaları sayıyoruz
  for (let i = 0; i < obstacles.length; i++) {
    if (obstacles[i].userData.solved) {
      if (obstacles[i].userData.type === "Araştırma Numunesi") {
        numune++;
      } else if (obstacles[i].userData.type === "Uzay Çöpü") {
        cop++;
      } else if (obstacles[i].userData.type === "Nadir Ay Taşı") {
        kaya++;
      }
    }
  }

  if (progressText && progressFill) {
    progressText.innerText = `İlerleme: ${collectedDebris} / ${totalDebris}`;
    if (progressTextObs) {
      progressTextObs.innerHTML = `Uzay Cisimleri Temizliği:<br><br>${numune} / 3 Araştırma Numunesi<br>${cop} / 3 Uzay Çöpü<br>${kaya} / 3 Nadir Ay Taşı`;
    }
    progressFill.style.width = `${(collectedDebris / totalDebris) * 100}%`;
  }
}

// --- Interactions & Physics Math ---

function handleKey(key, isDown) {
  const k = key.toLowerCase();
  if (k === "w" || k === "arrowup") keys.w = isDown;
  if (k === "s" || k === "arrowdown") keys.s = isDown;
  if (k === "a" || k === "arrowleft") keys.a = isDown;
  if (k === "d" || k === "arrowright") keys.d = isDown;
  if (k === " " || k === "space") keys.space = isDown;
}

function getTerrainHeightAt(x, z) {
  if (!terrainMesh) return 0;
  // Position raycaster high above target point
  const origin = new THREE.Vector3(x, 500, z);
  raycaster.set(origin, downVector);

  const intersects = raycaster.intersectObject(terrainMesh);
  if (intersects.length > 0) {
    return intersects[0].point.y;
  }
  return 0; // fallback
}

function updateMapDot(x, z) {
  const roverDot = document.getElementById("minimap-rover");
  if (roverDot) {
    let mapY = 90 - (Math.abs(z) / 1800) * 80;
    let mapX = 50 + (x / 200) * 40;
    mapY = Math.max(0, Math.min(100, mapY));
    mapX = Math.max(0, Math.min(100, mapX));
    roverDot.style.top = `${mapY}%`;
    roverDot.style.left = `${mapX}%`;
  }
}


function updateRoverMovement() {
  if (!isGameRunning || isQuizActive) return;

  const moveSpeed = 0.6; // Slightly faster for 15 min game to cover ground
  const turnSpeed = 0.04;

  let intendedZ = roverGroup.position.z;
  let intendedX = roverGroup.position.x;

  let forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(roverGroup.quaternion);
  let backVector = new THREE.Vector3(0, 0, 1).applyQuaternion(roverGroup.quaternion);

  if (keys.w) {
    intendedX += forwardVector.x * moveSpeed;
    intendedZ += forwardVector.z * moveSpeed;
  }
  if (keys.s) {
    intendedX += backVector.x * moveSpeed;
    intendedZ += backVector.z * moveSpeed;
  }

  if (keys.a) roverGroup.rotation.y += turnSpeed;
  if (keys.d) roverGroup.rotation.y -= turnSpeed;

  // Collision barrier logic for active obstacle
  let canMove = true;

  if (activeObstacleIndex < obstacles.length) {
    const obstacleMesh = obstacles[activeObstacleIndex];
    const currentBarrierZ = obstacleMesh.position.z;


    // If player tries to move past the barrier without solving
    if (intendedZ < currentBarrierZ + 20) {
      // Barrier is active
      canMove = false;

      warningUI.style.display = "block";
      warningUI.innerText = "Soruya cevap verene kadar Ay yüzeyinde ilerleyemezsin!";

      checkObstacleEncounter(obstacleMesh, intendedZ);
    }
  }

  if (canMove) {
    warningUI.style.display = "none";
    roverGroup.position.x = intendedX;
    roverGroup.position.z = intendedZ;
  }

  // Check end game
  if (activeObstacleIndex >= obstacles.length && roverGroup.position.distanceTo(rocketGroup.position) < 30) {
    endGame(true);
  }

  // Physics: Gravity & Terrain collision!
  const terrainHeight = getTerrainHeightAt(roverGroup.position.x, roverGroup.position.z);

  // Jump logic
  //if (keys.space && isGrounded) {
  //  velocityY = 0.45; // Jump power
  //  isGrounded = false;
  //}

  // Apply vertical velocity (Gravity)
  if (!isGrounded) {
    velocityY -= gravity; // Gravity
    roverGroup.position.y += velocityY;
  }

  // Ground collision (Allow small threshold)
  if (roverGroup.position.y <= terrainHeight) {
    roverGroup.position.y = terrainHeight;
    velocityY = 0;
    isGrounded = true;
  } else {
    // If we're significantly above ground, we are not grounded
    if (roverGroup.position.y > terrainHeight + 0.1) {
      isGrounded = false;
    }
  }

  updateCamera();

  // Radar animation
  if (roverRadar) roverRadar.rotation.y += 0.05;

  // Propeller animation
  if (roverPropeller) roverPropeller.rotation.y += 0.2;

  // Navigation Arrow logic
  if (navArrow) {
    if (gameMode === 'landing') {
      navArrow.visible = false;
    } else {
      const target = obstacles[activeObstacleIndex];
      if (target && isGameRunning) {
        navArrow.visible = true;
        navArrow.position.set(roverGroup.position.x, roverGroup.position.y + 10, roverGroup.position.z);
        navArrow.lookAt(target.position);
      } else {
        navArrow.visible = false;
      }
    }
  }

  // Debris Indicator logic (Sequential Visibility)
  obstacles.forEach((o, index) => {
    if (o.userData.indicator) {
      if (!o.userData.solved && index === activeObstacleIndex) {
        o.userData.indicator.visible = true;
        o.userData.indicator.rotation.y += 0.05;
        o.userData.indicator.position.y = 5 + Math.sin(Date.now() * 0.005) * 0.5;
      } else {
        o.userData.indicator.visible = false;
      }
    }
  });

  // Update Mini-Map
  updateMapDot(roverGroup.position.x, roverGroup.position.z);
}

function updateCamera() {
  const relativeCameraOffset = new THREE.Vector3(0, 10, 25);
  const cameraOffset = relativeCameraOffset.applyMatrix4(roverGroup.matrixWorld);
  camera.position.lerp(cameraOffset, 0.1);
  camera.lookAt(roverGroup.position.x, roverGroup.position.y + 2, roverGroup.position.z);
}

function checkObstacleEncounter(obstacle, intendedZ) {
  const dist = roverGroup.position.distanceTo(obstacle.position);
  if (dist < 30 && !obstacle.userData.solved) {
    triggerQuiz(obstacle);
  } else if (!obstacle.userData.solved) {
    // Warning before hitting (Disabled for now)
  }
}

// --- Quiz & AI System ---

function triggerQuiz(obstacle) {
  warningUI.style.display = "none";

  isQuizActive = true;

  keys.w = keys.a = keys.s = keys.d = keys.space = false;

  const qObj = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];

  const msg = `${obstacle.userData.type} tespit edildi! Toplama/Analiz protokolü için şifreyi çöz:\n\n${qObj.question}`;

  showQuizModal(msg, true);

  const optionsContainer = document.getElementById("dialog-options");
  optionsContainer.innerHTML = "";

  qObj.options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + index)}</span> ${opt}`;
    btn.onclick = () => handleAnswer(index, qObj.correct, btn, obstacle);
    optionsContainer.appendChild(btn);
  });
}

function handleAnswer(selectedIndex, correctIndex, btnElement, obstacle) {
  const isCorrect = selectedIndex === correctIndex;

  if (isCorrect) {
    btnElement.style.background = "rgba(0, 200, 83, 0.4)";

    if (gameMode === 'rover' && obstacle) {
      showQuizModal(`Tebrikler! ${obstacle.userData.type} başarıyla araca yüklendi.`, false);
      obstacle.userData.solved = true;
      obstacle.visible = false;
      if (obstacle.userData.minimapDot) {
        obstacle.userData.minimapDot.style.display = 'none';
      }
      collectedDebris++;
      updateProgressBar();
      activeObstacleIndex++;
      if (collectedDebris >= totalDebris) {
        setTimeout(() => endGame(true), 1500);
      }
    } else {
      // Landing Mode Fuel Gain (+10%)
      fuel = Math.min(100, fuel + 25);
      showQuizModal("Sistemler Yenilendi! +%25 Yakıt Kazandın.", false);
      updateLandingHUD();
    }
  } else {
    btnElement.style.background = "rgba(244, 67, 54, 0.4)";
    attemptsLeft--;
    wrongAnswers++;

    if (attemptsLeft <= 0 || wrongAnswers >= 3) {
      showQuizModal("Giriş Denemeleri Tükendi. Sistem Devre Dışı.", false);
      setTimeout(() => endGame(false), 3000);
    } else {
      showQuizModal(`Yanlış cevap! Araç zarar görüyor. ${attemptsLeft} deneme hakkın kaldı.`, false);
    }
  }

  const nextBtn = document.getElementById("dialog-next-btn");
  nextBtn.innerText = "Devam Et";
  nextBtn.style.display = "block";
  nextBtn.onclick = () => {
    uiQuizModal.style.display = "none";
    isQuizActive = false;
  };
}

// --- Main Loop ---

function animate() {
  requestAnimationFrame(animate);

  if (isGameRunning && !isQuizActive) {
    if (gameMode === 'rover') {
      updateRoverMovement();
      updateMinimap();
    } else {
      updateLandingMovement();
    }
  }

  if (renderer) {
    renderer.render(scene, camera);
  }
}

function updateLandingMovement() {
  // Mouse Mapping Interpolation
  const dx = targetLandingX - landingRocket.position.x;
  const dy = targetLandingY - landingRocket.position.y;

  let moved = false;

  // Smoothly lerp towards mouse pointer for X and Y axes
  if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
    landingRocket.position.x += dx * 0.05;
    landingRocket.position.y += dy * 0.05;
    moved = true;
  }

  // WASD + Arrow Keys 3D Movement (Overrides/adds to mouse)
  const speed = 1.2;

  if (keys.w) {
    landingRocket.position.z -= speed;
    moved = true;
  }
  if (keys.s) {
    landingRocket.position.z += speed;
    moved = true;
  }
  if (keys.a) {
    landingRocket.position.x -= speed;
    moved = true;
  }
  if (keys.d) {
    landingRocket.position.x += speed;
    moved = true;
  }

  // Dynamic Fuel Consumption (Each move consumes 0.05 units)
  if (moved) {
    fuel -= 0.05;
    if (fuel <= 0) {
      fuel = 0;
      triggerFuelQuiz();
    }
  }

  // Spawning obstacles (Meteors and Space Junk)
  if (Math.random() < 0.12) spawnMeteor(); // Spawn frequency slightly increased

  // Update obstacles and check collision
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    m.position.z += 5.5; // Fly past quickly towards player

    // Spin 3D junk
    if (m.isMesh) {
      m.rotation.x += 0.02;
      m.rotation.y += 0.02;
    }

    // Remove if passed
    if (m.position.z > landingRocket.position.z + 50) {
      scene.remove(m);
      meteors.splice(i, 1);
      continue;
    }

    // Collision Check
    const dist = m.position.distanceTo(landingRocket.position);
    if (dist < 4) {
      lives--;
      scene.remove(m);
      meteors.splice(i, 1);
      updateLandingHUD();
      if (lives <= 0) endGame(false);
    }
  }

  // Victory: Reached Moon Surface
  if (landingRocket.position.z < -1950) {
    endGame(true);
  }

  updateLandingHUD();

  // POV: Camera behind rocket
  camera.position.set(
    landingRocket.position.x,
    landingRocket.position.y + 7.5,
    landingRocket.position.z + 25
  );
  camera.lookAt(
    landingRocket.position.x,
    landingRocket.position.y,
    landingRocket.position.z - 50
  );
}

function updateLandingHUD() {
  const fuelText = document.getElementById("fuel-text");
  const fuelFill = document.getElementById("fuel-fill");
  const livesText = document.getElementById("lives-text");

  if (fuelText) fuelText.innerText = `YAKIT: %${Math.max(0, Math.floor(fuel))}`;
  if (fuelFill) fuelFill.style.width = `${Math.max(0, fuel)}%`;
  if (livesText) livesText.innerText = `❤️ ${lives} CAN`;
}

function triggerFuelQuiz() {
  isQuizActive = true;
  keys.w = keys.a = keys.s = keys.d = keys.space = false;

  const qObj = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
  showQuizModal(`YAKIT BİTTİ! Sistemi yeniden başlatmak için soruyu çöz:\n\n${qObj.question}`, true);

  const optionsContainer = document.getElementById("dialog-options");
  optionsContainer.innerHTML = "";
  qObj.options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerText = opt;
    btn.onclick = () => handleAnswer(index, qObj.correct, btn, null); // Pass null as obstacle
    optionsContainer.appendChild(btn);
  });
}
