/* =====================================================
   Uzay İstasyonu Arıza Giderme Oyunu V3.0 (Full 3D İzometrik)
   ===================================================== */

let sScene, sCamera, sRenderer;
let sPlayerGroup, sFlashlight, sModelGroup;
let sMixer; // For animations if needed
let stationIsRunning = false;
let sKeys = {};
let sTimeRemaining = 15 * 60; // 15 mins
let sErrors = 0;
const MAX_ERRORS = 5;
let sLastTime = 0;

// Game State
let sPlayer = { x: 0, z: 0, speed: 120, radius: 15, name: "Astronot", gender: "erkek" };

const dist = 300;
const sRooms = [
  { name: "Lobi", type: "octagon", x: 0, z: 0, radius: 135, color: 0x334455 },
  { name: "Kontrol", type: "rect", x: 0, z: -dist, w: 180, d: 180, color: 0x112233 },
  { name: "Motor Dairesi", type: "rect", x: 0, z: dist, w: 180, d: 180, color: 0x442200 },
  { name: "Kamera", type: "rect", x: dist, z: 0, w: 180, d: 180, color: 0x331144 },
  { name: "Depo", type: "rect", x: -dist, z: 0, w: 180, d: 180, color: 0x222222 },
  { name: "Elektrik", type: "rect", x: -dist, z: dist, w: 180, d: 180, color: 0x331111 },
  { name: "Radar", type: "circle", x: dist, z: dist, radius: 100, color: 0x113311 },
  { name: "Oksijen", type: "rect", x: -dist, z: -dist, w: 180, d: 180, color: 0x333311 },
  { name: "Tıbbi", type: "circle", x: dist, z: -dist, radius: 100, color: 0x114444 }
];

const sHalls = [
  // İÇ KORİDORLAR — Lobi (merkez) ile komşu odaları birleştiriyor
  // Koridorlar 240 uzunlukta: boşluğu (300 - 90/2 - 90/2) tam kapatıyor
  { x: 0, z: -150, w: 90, d: 240 }, // Lobi -> Kontrol
  { x: 0, z: 150, w: 90, d: 240 }, // Lobi -> Motor
  { x: -150, z: 0, w: 240, d: 90 }, // Lobi -> Depo
  { x: 150, z: 0, w: 240, d: 90 }, // Lobi -> Kamera
  // DIŞ HALKA — dikey (sol/sağ sütun odaları)
  { x: -dist, z: -150, w: 90, d: 240 }, // Oksijen -> Depo
  { x: -dist, z: 150, w: 90, d: 240 }, // Depo -> Elektrik
  { x: dist, z: -150, w: 90, d: 240 }, // Tıbbi -> Kamera
  { x: dist, z: 150, w: 90, d: 240 }, // Kamera -> Radar
  // DIŞ HALKA — yatay (üst/alt sıra odaları)
  { x: -150, z: -dist, w: 240, d: 90 }, // Oksijen -> Kontrol
  { x: 150, z: -dist, w: 240, d: 90 }, // Kontrol -> Tıbbi
  { x: -150, z: dist, w: 240, d: 90 }, // Elektrik -> Motor
  { x: 150, z: dist, w: 240, d: 90 }  // Motor -> Radar
];

const sTasks = [
  { id: "elec1", name: "Kablo Bağlantısı", desc: "Devreyi Eşleştir", x: -330, z: 300, completed: false, type: "synonym", room: "Elektrik" },
  { id: "elec2", name: "Voltaj Dengeleyici", desc: "Gücü 100 Yap", x: -270, z: 270, completed: false, type: "voltage", room: "Elektrik" },
  { id: "oxy1", name: "Oksijen Filtresi", desc: "Zıt Anlamı Bul", x: -330, z: -300, completed: false, type: "antonym", room: "Oksijen" },
  { id: "oxy2", name: "Boru Kalibrasyonu", desc: "Boruları Döndür", x: -270, z: -270, completed: false, type: "pipe", room: "Oksijen" },
  { id: "motor", name: "Motor Soğutma", desc: "Reaktör Kodunu Gir", x: 0, z: 360, completed: false, type: "simon", room: "Motor" },
  { id: "med", name: "DNA Analizi", desc: "Sağlık Taraması", x: 300, z: -270, completed: false, type: "biology", room: "Tıbbi" },
  { id: "cam", name: "Anomali Tespiti", desc: "Farklı Olanı Seç", x: 360, z: 0, completed: false, type: "oddout", room: "Kamera" },
  { id: "radar", name: "Radar Dinleme", desc: "Sinyal Yakala", x: 300, z: 300, completed: false, type: "radar_ping", room: "Radar" },
  { id: "store", name: "Kargo Düzenleme", desc: "Gezegenleri Sırala", x: -360, z: 0, completed: false, type: "sorting", room: "Depo" },
  { id: "ctrl", name: "Navigasyon Şifresi", desc: "Hafıza Oyunu", x: 0, z: -360, completed: false, type: "memory", room: "Kontrol" }
];

let sActiveTask = null;
let sNearbyTask = null;
let sTaskMeshes = []; // To update pulsing lights
let interactionRaycaster; // For mouse clicks if needed later

let lastPlayerDirAngle = 0; // For rotating flashlight

function startStationGame() {
  const btn = document.getElementById("startStationBtn");
  if (btn) btn.innerText = "Yükleniyor...";

  sPlayer.name = document.getElementById("stationPlayerName").value.trim() || "Kaşif";
  sPlayer.gender = document.getElementById("stationGender").value;
  sPlayer.x = 0;
  sPlayer.z = 0;
  sTimeRemaining = 15 * 60;
  sErrors = 0;
  sTasks.forEach(t => t.completed = false);
  sActiveTask = null;
  sNearbyTask = null;

  initThreeJSStation();

  updateStationHUD();
  document.getElementById("station-game-menu").style.display = "none";
  document.getElementById("station-hud").style.display = "flex";

  // Show tutorial overlay briefly
  let tut = document.getElementById("station-tutorial-overlay");
  if (tut) {
    tut.style.display = "block";
    setTimeout(() => tut.style.display = "none", 6000);
  }

  stationIsRunning = true;
  sLastTime = performance.now();
  requestAnimationFrame(stationLoop);

  // Reset button for next time (after a timeout so it's not jarring)
  setTimeout(() => { if (btn) btn.innerText = "Görevi Başlat"; }, 2000);
}

function initThreeJSStation() {
  let container = document.getElementById("game-canvas-container");
  container.innerHTML = ""; // Clear existing (like old Three.js scene)

  sScene = new THREE.Scene();
  sScene.background = new THREE.Color(0x020205);
  // Add space dust (particles)
  let ptGeo = new THREE.BufferGeometry();
  let ptVars = [];
  for (let i = 0; i < 800; i++) {
    ptVars.push((Math.random() - 0.5) * 1500, (Math.random() - 0.5) * 500 + 100, (Math.random() - 0.5) * 1500);
  }
  ptGeo.setAttribute('position', new THREE.Float32BufferAttribute(ptVars, 3));
  let ptMat = new THREE.PointsMaterial({ color: 0x00ffcc, size: 2, transparent: true, opacity: 0.6 });
  let ptMesh = new THREE.Points(ptGeo, ptMat);
  sScene.add(ptMesh);

  // Camera Isometric Top-Down
  sCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 3000);
  sRenderer = new THREE.WebGLRenderer({ antialias: true });
  sRenderer.setSize(window.innerWidth, window.innerHeight);
  sRenderer.shadowMap.enabled = true;
  sRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(sRenderer.domElement);

  // === AYDINLATMA — DENGELİ IŞIK ===
  let ambient = new THREE.AmbientLight(0xffffff, 0.4); // Çok loş, huzurlu uzay boşluğu
  sScene.add(ambient);

  let mainLight = new THREE.DirectionalLight(0xffffff, 0.2); // Zayıf uzak yıldız ışığı
  mainLight.position.set(300, 700, 300);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  mainLight.shadow.camera.left = -700;
  mainLight.shadow.camera.right = 700;
  mainLight.shadow.camera.top = 700;
  mainLight.shadow.camera.bottom = -700;
  sScene.add(mainLight);

  // Her odada özel renkli dolgu ışığı — GENİŞ ALAN
  const roomLightColors = {
    'Lobi': 0x4488ff,
    'Kontrol': 0x00ffcc,
    'Motor Dairesi': 0xff8800,
    'Kamera': 0xaa44ff,
    'Depo': 0x88aacc,
    'Elektrik': 0xff2200,
    'Radar': 0x44ff88,
    'Oksijen': 0x88ff44,
    'Tıbbi': 0xff88aa
  };
  sRooms.forEach(r => {
    let col = roomLightColors[r.name] || 0xffffff;
    let pLight = new THREE.PointLight(col, 0.3, 600); // 1.2'den 0.3'e çok kısıldı
    pLight.position.set(r.x, 80, r.z);
    sScene.add(pLight);
    // İkinci düşük nokta ışığı zemin yakınında
    let groundLight = new THREE.PointLight(col, 0.1, 250); // 0.4'ten 0.1'e
    groundLight.position.set(r.x, 15, r.z);
    sScene.add(groundLight);
  });
  // Koridor ışıkları
  sHalls.forEach(h => {
    let hLight = new THREE.PointLight(0xffffff, 0.2, 300); // 0.6'dan 0.2'ye kısıldı
    hLight.position.set(h.x, 40, h.z);
    sScene.add(hLight);
  });

  // Build Map Geometries
  buildMap3D();

  // Create Player Group
  createPlayer3D();

  // Create Task Consoles
  createTasks3D();

  // Add decorative objects
  addDecorations3D();

  window.addEventListener('resize', () => {
    sCamera.aspect = window.innerWidth / window.innerHeight;
    sCamera.updateProjectionMatrix();
    sRenderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function buildMap3D() {
  // Optimizasyon için ortak materyaller ve geometriler - Göz Yormayan Renkler
  let floorMatDefault = new THREE.MeshStandardMaterial({
    color: 0x222225, metalness: 0.2, roughness: 0.8
  });
  let wallMat = new THREE.MeshStandardMaterial({
    color: 0x111115, metalness: 0.5, roughness: 0.5, transparent: true, opacity: 0.4
  });

  // Odaları ve koridorları birbirine bağlayan kesintisiz görünüm oluşturuyoruz.
  for (let r of sRooms) {
    let geo;
    if (r.type === "octagon") {
      geo = new THREE.CylinderGeometry(r.radius, r.radius, 2, 8);
    } else if (r.type === "circle") {
      geo = new THREE.CylinderGeometry(r.radius, r.radius, 2, 32);
    } else {
      geo = new THREE.BoxGeometry(r.w, 2, r.d);
    }

    let mat = new THREE.MeshStandardMaterial({ color: r.color, metalness: 0.3, roughness: 0.3 });
    let floor = new THREE.Mesh(geo, mat);
    floor.position.set(r.x, 0, r.z);
    floor.receiveShadow = true;
    sScene.add(floor);

    // Dış koruma neon çerçevesi
    let edgeLineGeo = new THREE.EdgesGeometry(geo);
    let edgeLine = new THREE.LineSegments(edgeLineGeo, new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2, transparent: true, opacity: 0.8 }));
    edgeLine.position.set(r.x, 1.5, r.z);
    if (geo.type !== "BoxGeometry") edgeLine.rotation.y = Math.PI / geo.parameters.radialSegments;
    sScene.add(edgeLine);

    // Zemin decali
    let decalGeo = (r.type === "octagon" || r.type === "circle") ? new THREE.TorusGeometry(r.radius - 20, 3, 4, 32) : new THREE.BoxGeometry(r.w - 40, 3, r.d - 40);
    let decal = new THREE.Mesh(decalGeo, new THREE.MeshBasicMaterial({ color: r.color, transparent: true, opacity: 0.5 }));
    decal.position.set(r.x, 0.5, r.z);
    if (decalGeo.type === "TorusGeometry") decal.rotation.x = Math.PI / 2;
    sScene.add(decal);
  }

  for (let h of sHalls) {
    let geo = new THREE.BoxGeometry(h.w, 2, h.d);
    let floor = new THREE.Mesh(geo, floorMatDefault);
    floor.position.set(h.x, 0, h.z);
    if (h.rot) floor.rotation.y = h.rot;
    floor.receiveShadow = true;
    sScene.add(floor);

    // Yarı saydam tünel duvarları
    let wX = h.w / 2;
    let dZ = h.d / 2;
    // Sol ve sağ duvar
    let wall1 = new THREE.Mesh(new THREE.BoxGeometry(2, 40, h.d), wallMat);
    let wall2 = new THREE.Mesh(new THREE.BoxGeometry(2, 40, h.d), wallMat);
    wall1.position.set(h.x - wX, 20, h.z);
    wall2.position.set(h.x + wX, 20, h.z);
    if (h.rot) { wall1.rotation.y = h.rot; wall2.rotation.y = h.rot; }
    sScene.add(wall1, wall2);

    // Yer Çizgisi Aydınlatması
    let stripe = new THREE.Mesh(new THREE.BoxGeometry(h.w * 0.2, 0.5, h.d * 0.8), new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.4 }));
    stripe.position.set(h.x, 1.2, h.z);
    sScene.add(stripe);
  }
}
function addDecorations3D() {
  // Daha hizli yuklenme icin Reusable Materyaller ve Geometriler! (Eskisi dongu icinde yuzlerce obje olusturuyordu)
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x556677, metalness: 0.8, roughness: 0.5 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x112233, metalness: 0.4, roughness: 0.4 });
  const cargoMat = new THREE.MeshStandardMaterial({ color: 0x887766, roughness: 0.9 });
  const techMat = new THREE.MeshStandardMaterial({ color: 0x223355, metalness: 0.6, roughness: 0.3 });
  const mediMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.6 });
  const plantMat = new THREE.MeshStandardMaterial({ color: 0x118833, roughness: 0.8 });
  const glowCyan = new THREE.MeshStandardMaterial({ color: 0x0088cc, emissive: 0x004466, emissiveIntensity: 0.2 });
  const glowOrange = new THREE.MeshStandardMaterial({ color: 0xcc6600, emissive: 0x663300, emissiveIntensity: 0.2 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x4488aa, transparent: true, opacity: 0.1, roughness: 0.2 });

  const geoCrateSmall = new THREE.BoxGeometry(16, 16, 16);
  const geoCrateLarge = new THREE.BoxGeometry(24, 24, 24);
  const geoPipe = new THREE.CylinderGeometry(4, 4, 160, 12);
  const geoBedFrame = new THREE.BoxGeometry(24, 8, 44);
  const geoMedicalScreen = new THREE.PlaneGeometry(12, 8);
  const geoGlassTube = new THREE.CylinderGeometry(10, 10, 36, 16);
  const geoPlantCapsule = new THREE.CylinderGeometry(5, 5, 20, 16);
  const geoServerRack = new THREE.BoxGeometry(18, 60, 18);
  const geoRadarDish = new THREE.SphereGeometry(45, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.5);
  const geoHoloRing = new THREE.TorusGeometry(38, 2, 8, 32);

  for (let r of sRooms) {
    if (r.name === 'Depo') {
      for (let i = 0; i < 40; i++) {
        let isLarge = Math.random() > 0.5;
        let c = new THREE.Mesh(isLarge ? geoCrateLarge : geoCrateSmall, cargoMat);
        let s = isLarge ? 24 : 16;
        c.position.set(r.x + (Math.random() - 0.5) * 150, s / 2, r.z + (Math.random() - 0.5) * 150);
        c.rotation.y = Math.random() * Math.PI;
        sScene.add(c);
      }
    }
    else if (r.name === 'Motor Dairesi') {
      let core = new THREE.Mesh(new THREE.CylinderGeometry(30, 35, 60, 16), metalMat);
      core.position.set(r.x, 30, r.z);
      sScene.add(core);

      let coreGlow = new THREE.Mesh(new THREE.TorusGeometry(36, 4, 16, 32), glowOrange);
      coreGlow.rotation.x = Math.PI / 2; coreGlow.position.set(r.x, 30, r.z);
      sScene.add(coreGlow);

      for (let i of [-50, 50]) {
        let p = new THREE.Mesh(geoPipe, metalMat);
        p.rotation.z = Math.PI / 2; p.position.set(r.x, 10, r.z + i);
        sScene.add(p);
      }
    }
    else if (r.name === 'Tıbbi') {
      for (let i = 0; i < 5; i++) {
        let a = (i / 5) * Math.PI * 2;
        let bed = new THREE.Mesh(geoBedFrame, mediMat);
        bed.position.set(r.x + Math.cos(a) * 65, 4, r.z + Math.sin(a) * 65);
        bed.rotation.y = -a + Math.PI / 2;
        sScene.add(bed);
        let scr = new THREE.Mesh(geoMedicalScreen, glowCyan);
        scr.position.set(bed.position.x, 22, bed.position.z + 15);
        sScene.add(scr);
      }
    }
    else if (r.name === 'Oksijen') {
      for (let i = 0; i < 18; i++) {
        let x = r.x + (Math.random() - 0.5) * 140;
        let z = r.z + (Math.random() - 0.5) * 140;
        let tube = new THREE.Mesh(geoGlassTube, glassMat); tube.position.set(x, 18, z); sScene.add(tube);
        let plant = new THREE.Mesh(geoPlantCapsule, plantMat); plant.position.set(x, 15, z); sScene.add(plant);
      }
    }
    else if (r.name === 'Kontrol' || r.name === 'Kamera') {
      for (let i = 0; i < 14; i++) {
        let rack = new THREE.Mesh(geoServerRack, darkMat);
        let rx = r.x + (Math.random() - 0.5) * 150;
        let rz = r.z + (Math.random() - 0.5) * 150;
        rack.position.set(rx, 30, rz);
        sScene.add(rack);
        let led = new THREE.Mesh(new THREE.BoxGeometry(19, 2, 8), Math.random() > 0.5 ? glowCyan : glowOrange);
        led.position.set(rx, 40, rz); sScene.add(led);
      }
    }
    else if (r.name === 'Radar') {
      let tower = new THREE.Mesh(new THREE.CylinderGeometry(15, 25, 60, 16), metalMat);
      tower.position.set(r.x, 30, r.z); sScene.add(tower);
      let rotGrp = new THREE.Group();
      let dish = new THREE.Mesh(geoRadarDish, metalMat); dish.position.z = 45;
      rotGrp.add(dish); rotGrp.position.set(r.x, 65, r.z); sScene.add(rotGrp);
      (function spin() { if (stationIsRunning) { rotGrp.rotation.y += 0.02; requestAnimationFrame(spin); } })();
    }
    else if (r.name === 'Lobi') {
      let base = new THREE.Mesh(new THREE.CylinderGeometry(45, 50, 12, 32), metalMat);
      base.position.set(r.x, 6, r.z); sScene.add(base);
      let ring = new THREE.Mesh(geoHoloRing, glowCyan); ring.rotation.x = Math.PI / 2; ring.position.set(r.x, 15, r.z); sScene.add(ring);
      let world = new THREE.Mesh(new THREE.SphereGeometry(25, 16, 16), new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.6 }));
      world.position.set(r.x, 45, r.z); sScene.add(world);
      (function spin() { if (stationIsRunning) { world.rotation.y += 0.01; ring.rotation.z += 0.02; requestAnimationFrame(spin); } })();
    }
    else if (r.name === 'Elektrik') {
      for (let i = 0; i < 8; i++) {
        let panel = new THREE.Mesh(new THREE.BoxGeometry(26, 45, 12), metalMat);
        panel.position.set(r.x + (Math.random() - 0.5) * 140, 22.5, r.z + (Math.random() - 0.5) * 140);
        panel.rotation.y = Math.random() * Math.PI; sScene.add(panel);
        let screen = new THREE.Mesh(new THREE.PlaneGeometry(18, 16), glowOrange);
        screen.position.set(panel.position.x, 28, panel.position.z - 6.1); screen.rotation.y = Math.PI + panel.rotation.y; sScene.add(screen);
      }
    }
  }
}

function createPlayer3D() {
  sPlayerGroup = new THREE.Group();
  sModelGroup = new THREE.Group();
  sPlayerGroup.position.set(sPlayer.x, 0, sPlayer.z);

  const accColor = sPlayer.gender === 'kadin' ? 0xff44cc : 0x00ccff;

  // Modern Materials
  const suitMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 });
  const jointMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8, metalness: 0.5 });
  const visorMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 1.0, roughness: 0.05, envMapIntensity: 2.0 });
  const accMat = new THREE.MeshStandardMaterial({ color: accColor, emissive: accColor, emissiveIntensity: 0.6 });
  const packMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7, roughness: 0.2 });

  // Body
  let torso = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 20, 16), suitMat);
  torso.position.y = 22; torso.castShadow = true;
  sModelGroup.add(torso);

  // Helmet
  let head = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 32), suitMat);
  head.position.y = 40; head.castShadow = true;
  sModelGroup.add(head);

  // Visor (Gold)
  let visor = new THREE.Mesh(new THREE.SphereGeometry(9, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.2), visorMat);
  visor.position.set(0, 40, -2); visor.rotation.x = Math.PI / 2;
  sModelGroup.add(visor);

  // Oxygen Jetpack
  let pack = new THREE.Mesh(new THREE.BoxGeometry(14, 22, 8), packMat);
  pack.position.set(0, 24, 10); pack.castShadow = true;
  sModelGroup.add(pack);

  [-4, 4].forEach(tx => {
    let tank = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 20, 16), suitMat);
    tank.position.set(tx, 24, 14); sModelGroup.add(tank);
    let thruster = new THREE.Mesh(new THREE.ConeGeometry(2.5, 5, 16), jointMat);
    thruster.position.set(tx, 12, 14); sModelGroup.add(thruster);
    let glow = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 }));
    glow.position.set(tx, 10, 14); sModelGroup.add(glow);
  });

  // Chest Display
  let chest = new THREE.Mesh(new THREE.PlaneGeometry(10, 7), new THREE.MeshBasicMaterial({ color: 0x111111 }));
  chest.position.set(0, 26, -11.5); sModelGroup.add(chest);
  let chestNeon = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), accMat);
  chestNeon.position.set(0, 26, -11.6); sModelGroup.add(chestNeon);

  // Limbs
  [-1, 1].forEach(side => {
    let shoulder = new THREE.Mesh(new THREE.SphereGeometry(5.5, 16, 16), jointMat);
    shoulder.position.set(side * 14, 32, 0); sModelGroup.add(shoulder);
    let arm = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 14, 16), suitMat);
    arm.position.set(side * 15, 22, 0); sModelGroup.add(arm);
    let glove = new THREE.Mesh(new THREE.SphereGeometry(4.5, 16, 16), jointMat);
    glove.position.set(side * 15, 12, 2); sModelGroup.add(glove);

    let leg = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 16, 16), suitMat);
    leg.position.set(side * 6, 10, 0); sModelGroup.add(leg);
    let boot = new THREE.Mesh(new THREE.BoxGeometry(11, 6, 14), jointMat);
    boot.position.set(side * 6, 0, 2); sModelGroup.add(boot);
  });

  sPlayerGroup.add(sModelGroup);

  // Balanced Flashlight (Zayıf El Feneri)
  sFlashlight = new THREE.SpotLight(0xffffff, 0.8, 800, Math.PI / 5, 0.4, 1.5);
  sFlashlight.position.set(0, 40, 0);
  sFlashlight.target.position.set(0, 20, -100);
  sPlayerGroup.add(sFlashlight, sFlashlight.target);

  let visorGlow = new THREE.PointLight(0xffffff, 0.1, 40);
  visorGlow.position.set(0, 42, -12); sModelGroup.add(visorGlow);

  let playerGlow = new THREE.PointLight(accColor, 0.1, 100);
  playerGlow.position.set(0, 25, 0); sPlayerGroup.add(playerGlow);

  sScene.add(sPlayerGroup);
}

function createTasks3D() {
  sTaskMeshes = [];
  let consoleGeo = new THREE.BoxGeometry(20, 25, 20);
  let screenGeo = new THREE.PlaneGeometry(16, 12);
  let baseMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });

  for (let t of sTasks) {
    let group = new THREE.Group();
    group.position.set(t.x, 12.5, t.z);

    let base = new THREE.Mesh(consoleGeo, baseMat);
    base.castShadow = true;
    base.receiveShadow = true;

    let screenMat = new THREE.MeshStandardMaterial({
      color: 0xff3333, emissive: 0xff0000, emissiveIntensity: 0.8
    });
    let screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 5, -10.1);
    screen.rotation.y = Math.PI; // Face outwards

    // Rotating Danger Light above console
    let alertLight = new THREE.PointLight(0xff0000, 1, 100);
    alertLight.position.set(0, 20, 0);

    group.add(base, screen, alertLight);
    sScene.add(group);

    sTaskMeshes.push({ taskRef: t, group: group, screen: screen, light: alertLight });
  }
}

// Key listeners injected on load via script
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startStationBtn").addEventListener("click", startStationGame);

  window.addEventListener("keydown", (e) => {
    sKeys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'e' || e.key === 'enter') {
      if (sNearbyTask && !sActiveTask && !sNearbyTask.completed && stationIsRunning) {
        openTask(sNearbyTask);
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    sKeys[e.key.toLowerCase()] = false;
  });

  document.getElementById("station-close-modal").addEventListener("click", () => {
    closeStationModal(false);
  });
});

window.stopStationGame = function () {
  stationIsRunning = false;
  if (sRenderer) sRenderer.domElement.style.display = "none";
  closeStationModal();
};

function stationLoop(time) {
  if (!stationIsRunning) return;

  let dt = (time - sLastTime) / 1000;
  if (dt > 1) dt = 1;
  sLastTime = time;

  updateStation(dt);

  // Render Scene
  sRenderer.render(sScene, sCamera);

  requestAnimationFrame(stationLoop);
}

function updateStation(dt) {
  if (sActiveTask) return;

  sTimeRemaining -= dt;
  if (sTimeRemaining <= 0) {
    sTimeRemaining = 0;
    failStationGame("Süre doldu! İstasyon kontrolünü kaybettiniz.");
  }

  let nx = sPlayer.x;
  let nz = sPlayer.z;
  let moving = false;

  if (sKeys['w'] || sKeys['arrowup']) { nz -= sPlayer.speed * dt; moving = true; }
  if (sKeys['s'] || sKeys['arrowdown']) { nz += sPlayer.speed * dt; moving = true; }
  if (sKeys['a'] || sKeys['arrowleft']) { nx -= sPlayer.speed * dt; moving = true; }
  if (sKeys['d'] || sKeys['arrowright']) { nx += sPlayer.speed * dt; moving = true; }

  if (moving) {
    // Player Bobbing
    sModelGroup.position.y = Math.sin(performance.now() * 0.015) * 2;
    // Calculate rotation angle
    let dx = nx - sPlayer.x;
    let dz = nz - sPlayer.z;
    if (dx !== 0 || dz !== 0) {
      lastPlayerDirAngle = Math.atan2(dx, dz) + Math.PI;
    }
  } else {
    sModelGroup.position.y += (0 - sModelGroup.position.y) * 0.1; // Smooth reset
  }

  // Rotate Player Group towards movement direction (snappier rotation)
  sPlayerGroup.rotation.y += (lastPlayerDirAngle - sPlayerGroup.rotation.y) * 0.2;

  // Collision
  if (canMoveTo3D(nx, nz, sPlayer.radius)) {
    sPlayer.x = nx;
    sPlayer.z = nz;
  } else if (canMoveTo3D(nx, sPlayer.z, sPlayer.radius)) {
    sPlayer.x = nx;
  } else if (canMoveTo3D(sPlayer.x, nz, sPlayer.radius)) {
    sPlayer.z = nz;
  }
  sPlayerGroup.position.set(sPlayer.x, 20, sPlayer.z);

  // Smooth Camera Isometric Follow
  let camTargetX = sPlayer.x;
  let camTargetZ = sPlayer.z + 300;
  let camTargetY = 350;
  sCamera.position.x += (camTargetX - sCamera.position.x) * 0.05;
  sCamera.position.z += (camTargetZ - sCamera.position.z) * 0.05;
  sCamera.position.y += (camTargetY - sCamera.position.y) * 0.05;
  sCamera.lookAt(sPlayer.x, 0, sPlayer.z - 50); // Look slightly ahead of player

  // Interactions and Console Lights
  sNearbyTask = null;
  let tnow = performance.now();
  for (let tm of sTaskMeshes) {
    let dist = Math.hypot(sPlayer.x - tm.taskRef.x, sPlayer.z - tm.taskRef.z);

    if (dist < 80 && !tm.taskRef.completed) {
      sNearbyTask = tm.taskRef;
      // Show HTML tooltip overlay over 3D coordinates could be done, but HUD warning is easier:
      document.getElementById("ui-warning").style.display = "block";
      document.getElementById("ui-warning").innerHTML = `[E] ${tm.taskRef.name} Onar`;
      document.getElementById("ui-warning").style.top = "70%";
    }

    if (tm.taskRef.completed) {
      tm.screen.material.color.setHex(0x00ffcc);
      tm.screen.material.emissive.setHex(0x00ccaa);
      tm.light.color.setHex(0x00ffcc);
      tm.light.intensity = 0.5;
    } else {
      // Göz yormayan sabit loş kırmızı ışık (yanıp sönmeyi kaldırdık)
      tm.light.intensity = 0.4;
    }
  }

  if (!sNearbyTask) {
    document.getElementById("ui-warning").style.display = "none";
  }

  if (Math.floor(sTimeRemaining) % 1 === 0) {
    updateStationHUD();
  }
}

// Simplified 3D collision check using AABB / Circular logic
function canMoveTo3D(x, z, r) {
  // Check 4 corners of the circle representing player radius
  let pts = [
    { x: x - r, z: z - r }, { x: x + r, z: z - r },
    { x: x - r, z: z + r }, { x: x + r, z: z + r }
  ];

  for (let p of pts) {
    if (!isPointInAnyRoom(p.x, p.z)) return false;
  }
  return true;
}

function isPointInAnyRoom(px, pz) {
  for (let r of sRooms) {
    if (r.type === "rect") {
      let hw = r.w / 2, hd = r.d / 2;
      if (px >= r.x - hw && px <= r.x + hw && pz >= r.z - hd && pz <= r.z + hd) return true;
    } else {
      let dist = Math.hypot(px - r.x, pz - r.z);
      if (dist <= r.radius) return true;
    }
  }
  for (let h of sHalls) {
    let hw = h.w / 2, hd = h.d / 2;
    if (px >= h.x - hw && px <= h.x + hw && pz >= h.z - hd && pz <= h.z + hd) return true;
  }
  return false;
}

// ------ UI & GAME LOGIC ------

function updateStationHUD() {
  document.getElementById("stationErrors").innerText = `❤️ Can: ${MAX_ERRORS - sErrors}/${MAX_ERRORS}`;
  let mins = Math.floor(sTimeRemaining / 60);
  let secs = Math.floor(sTimeRemaining % 60);
  document.getElementById("stationTimer").innerText = `${mins}:${secs.toString().padStart(2, '0')}`;

  let ul = document.getElementById("stationTaskList");
  ul.innerHTML = "";
  let doneCount = 0;
  for (let t of sTasks) {
    let li = document.createElement("li");
    li.innerText = `[${t.room}] ${t.name} ${t.completed ? "✔️" : "⚠️"}`;
    li.style.color = t.completed ? "#00ffcc" : "#ffaa00";
    if (t.completed) { li.style.textDecoration = "line-through"; doneCount++; }
    ul.appendChild(li);
  }

  if (doneCount === sTasks.length && stationIsRunning) {
    winStationGame();
  }
}

function openTask(task) {
  sActiveTask = task;
  sKeys = {};
  document.getElementById("ui-warning").style.display = "none"; // Hide E prompt
  let modal = document.getElementById("station-modal");
  document.getElementById("station-modal-title").innerText = "Sistem Arızası: " + task.name;
  let content = document.getElementById("station-modal-content");
  content.innerHTML = "";

  // Premium 3D Themed UI Games
  if (task.type === "synonym") buildWireGame(content);
  else if (task.type === "voltage") buildVoltageSliderGame(content);
  else if (task.type === "pipe") buildPipeGame(content);
  else if (task.type === "radar_ping") buildRadarPingGame(content);
  else if (task.type === "fraction") buildFractionGame(content);
  else if (task.type === "simon") buildSimonGame(content);
  else if (task.type === "biology") buildBiologyGame(content);
  else if (task.type === "oddout") buildOddOutGame(content);
  else if (task.type === "sorting") buildSortingGame(content);
  else if (task.type === "memory") buildMemoryGame(content);
  else if (task.type === "antonym") buildAntonymGame(content); // Backup if needed

  modal.style.display = "block";
  document.getElementById("station-close-modal").style.display = "inline-block";
}

function closeStationModal(success = false) {
  document.getElementById("station-modal").style.display = "none";
  if (success && sActiveTask) {
    sActiveTask.completed = true;
    showToast("Mükemmel! Sistem tamir edildi.", "success");
    updateStationHUD();
  }
  sActiveTask = null;
}

function makeMistake() {
  sErrors++;
  updateStationHUD();
  showToast("Hatalı işlem! Sistem hata verdi.", "error");

  let modal = document.getElementById("station-modal");
  modal.style.transform = "translate(15px, 15px)";
  setTimeout(() => modal.style.transform = "translate(-15px, -15px)", 50);
  setTimeout(() => modal.style.transform = "translate(15px, -15px)", 100);
  setTimeout(() => modal.style.transform = "translate(0, 0)", 150);

  if (sErrors >= MAX_ERRORS) {
    closeStationModal();
    failStationGame("Kritik Sistem Çöküşü! İstasyonda Yaşam Sona Erdi.");
  }
}

function failStationGame(msg) {
  stationIsRunning = false;
  document.getElementById("station-hud").style.display = "none";
  document.getElementById("game-result-panel").style.display = "block";
  document.getElementById("result-heading").innerText = "GÖREV BAŞARISIZ";
  document.getElementById("result-heading").style.color = "#ff4444";
  document.getElementById("result-description").innerText = msg;
  document.getElementById("restartGameBtn").onclick = () => {
    document.getElementById("game-result-panel").style.display = "none";
    showMenu();
  };
}

function winStationGame() {
  stationIsRunning = false;
  if (window.stopGlobalTimer) window.stopGlobalTimer();
  document.getElementById("station-hud").style.display = "none";
  document.getElementById("game-result-panel").style.display = "block";
  document.getElementById("result-heading").innerText = "İSTASYON KURTARILDI!";
  document.getElementById("result-heading").style.color = "#00ffcc";
  document.getElementById("result-description").innerText = "Uzay istasyonunu başarılı şekilde kurtardın tebrikler! Tüm sistemler aktif ve stabil.";
  document.getElementById("restartGameBtn").onclick = () => {
    document.getElementById("game-result-panel").style.display = "none";
    showMenu();
  };

  let puan = (15 * 60 - sTimeRemaining) < 0 ? 5000 : Math.floor(sTimeRemaining) * 10 + (MAX_ERRORS - sErrors) * 1000;
  if (window.skorKaydet) window.skorKaydet(sPlayer.name, puan, 'station');
}

// ==========================================
// PREMIUM MINI GAMES (Advanced UI)
// ==========================================

// 1. Interactive Wire Dragging (SVG) - Synonyms
function buildWireGame(container) {
  const pairs = [
    { a: "Siyah", b: "Kara", color: "#ff4444" },
    { a: "Kırmızı", b: "Al", color: "#4444ff" },
    { a: "Uzak", b: "Irak", color: "#00ffcc" }
  ];
  let left = pairs.map(p => ({ w: p.a, id: p.a, c: p.color })).sort(() => Math.random() - 0.5);
  let right = pairs.map(p => ({ w: p.b, m: p.a, c: p.color })).sort(() => Math.random() - 0.5);

  // KRİTİK GÜNCELLEME: 'user-select:none' eklendi
  container.innerHTML = `
    <div style="user-select: none; -webkit-user-select: none;"> 
      <p style="margin-bottom:10px;">Bağlantıları onarmak için kabloları EŞ ANLAMLI kelimelere sürükle:</p>
      <div style="position:relative; width:100%; height:250px; background:rgba(0,0,0,0.6); border-radius:10px; border: 1px inset #555; overflow:hidden;">
        <svg id="wireSvg" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;"></svg>
        <div id="sg-L" style="position:absolute; left:20px; top:20px; display:flex; flex-direction:column; gap:40px;"></div>
        <div id="sg-R" style="position:absolute; right:20px; top:20px; display:flex; flex-direction:column; gap:40px;"></div>
      </div>
    </div>
  `;

  let svg = document.getElementById("wireSvg");
  let matches = 0;
  let activePort = null;
  let currentLine = null;

  left.forEach((n, i) => {
    let port = document.createElement("div");
    // 'draggable="false"' ve 'pointer-events' kontrolü için stil güncellendi
    port.style = `display:flex; align-items:center; gap:10px; cursor:pointer;`;
    port.innerHTML = `<span style="color:#fff; width:60px; pointer-events:none;">${n.w}</span><div class="port-b" style="width:20px; height:20px; border-radius:50%; background:${n.c}; box-shadow: 0 0 10px ${n.c}"></div>`;

    port.querySelector('.port-b').onmousedown = (e) => {
      if (port.getAttribute("data-disabled") === "true") return;

      activePort = n;
      currentLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      currentLine.setAttribute("stroke", n.c);
      currentLine.setAttribute("stroke-width", "6");
      currentLine.setAttribute("stroke-linecap", "round");

      let rect = port.querySelector('.port-b').getBoundingClientRect();
      let pRect = svg.getBoundingClientRect(); // SVG'ye göre koordinat alıyoruz

      let startX = rect.left + rect.width / 2 - pRect.left;
      let startY = rect.top + rect.height / 2 - pRect.top;

      currentLine.setAttribute("x1", startX);
      currentLine.setAttribute("y1", startY);
      currentLine.setAttribute("x2", startX);
      currentLine.setAttribute("y2", startY);
      svg.appendChild(currentLine);

      const move = (em) => {
        let pRect = svg.getBoundingClientRect();
        currentLine.setAttribute("x2", em.clientX - pRect.left);
        currentLine.setAttribute("y2", em.clientY - pRect.top);
      };

      const up = (eu) => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);

        let droppedOnRight = false;
        let rightPorts = document.getElementById("sg-R").children;

        for (let rp of rightPorts) {
          let rRect = rp.querySelector('.port-b').getBoundingClientRect();
          // Mesafe kontrolü
          if (Math.hypot(eu.clientX - (rRect.left + 10), eu.clientY - (rRect.top + 10)) < 25) {
            if (rp.dataset.match === activePort.id) {
              // BAŞARI
              rp.querySelector('.port-b').style.background = activePort.c;
              rp.querySelector('.port-b').style.boxShadow = `0 0 10px ${activePort.c}`;
              port.setAttribute("data-disabled", "true");
              droppedOnRight = true;
              matches++;

              // Hattı tam merkeze kilitle
              currentLine.setAttribute("x2", rRect.left + rRect.width / 2 - pRect.left);
              currentLine.setAttribute("y2", rRect.top + rRect.height / 2 - pRect.top);

              if (matches === pairs.length) {
                setTimeout(() => { if (window.closeStationModal) closeStationModal(true); }, 500);
              }
              return;
            } else {
              if (window.makeMistake) makeMistake();
              break;
            }
          }
        }
        if (!droppedOnRight && currentLine) { svg.removeChild(currentLine); }
      };

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    };

    document.getElementById("sg-L").appendChild(port);
  });

  right.forEach((n, i) => {
    let port = document.createElement("div");
    port.dataset.match = n.m;
    port.style = `display:flex; align-items:center; gap:10px;`;
    port.innerHTML = `<div class="port-b" style="width:20px; height:20px; border-radius:50%; background:#444; border:2px solid #aaa;"></div><span style="color:#fff; width:60px; pointer-events:none;">${n.w}</span>`;
    document.getElementById("sg-R").appendChild(port);
  });
}

// 2. Vertical Smooth Sliders - Voltage
function buildVoltageSliderGame(container) {
  let v1 = Math.floor(Math.random() * 20); let v2 = Math.floor(Math.random() * 40) + 30; let v3 = Math.floor(Math.random() * 30);
  container.innerHTML = `
    <p>Güç yüklemesi dengesiz! Mikser kollarını sürükleyerek Toplam İvmeyi <b>%100</b> yapın.</p>
    <div style="font-size:36px; text-align:center; font-family:'Courier New', monospace; color:#00ffcc; text-shadow:0 0 10px #00ffcc; margin:20px 0;">
      ⚡ <span id="vs-total">0</span>%
    </div>
    <div style="display:flex; justify-content:space-evenly; align-items:center; height:150px;">
      <input type="range" orient="vertical" id="vs1" min="0" max="60" value="${v1}" style="appearance:slider-vertical; height:100%;">
      <input type="range" orient="vertical" id="vs2" min="0" max="60" value="${v2}" style="appearance:slider-vertical; height:100%;">
      <input type="range" orient="vertical" id="vs3" min="0" max="60" value="${v3}" style="appearance:slider-vertical; height:100%;">
    </div>
    <br/>
    <button class="btn btn-primary btn-glow" id="vs-submit" style="display:block; margin:0 auto;">Gücü Onayla</button>
  `;
  const upd = () => {
    let sum = parseInt(document.getElementById("vs1").value) + parseInt(document.getElementById("vs2").value) + parseInt(document.getElementById("vs3").value);
    document.getElementById("vs-total").innerText = sum;
    if (sum === 100) document.getElementById("vs-total").style.color = "#00ffcc";
    else document.getElementById("vs-total").style.color = "#ffaa00";
  };
  document.getElementById("vs1").oninput = upd; document.getElementById("vs2").oninput = upd; document.getElementById("vs3").oninput = upd; upd();
  document.getElementById("vs-submit").onclick = () => {
    let s = parseInt(document.getElementById("vs-total").innerText);
    if (s === 100) closeStationModal(true); else makeMistake();
  };
}

// 3. Radar Ping Game - Find the Anomaly
function buildRadarPingGame(container) {
  let words = ["Mars", "Jüpiter", "Dünya", "Yıldız"];
  let anomaly = "Yıldız";

  container.innerHTML = `
    <p>RADAR SİSTEMİ: Gezegen dışı anomalileri tespit et. <b>${anomaly}</b> ping'lendiğinde üzerine TIKLA!</p>
    <div style="position:relative; width:300px; height:300px; margin:0 auto; background:radial-gradient(circle, #003311 0%, #001100 100%); border-radius:50%; border:4px solid #00ff55; overflow:hidden;">
      <div id="radarLine" style="position:absolute; top:50%; left:50%; width:150px; height:2px; background:linear-gradient(90deg, transparent, #00ff55); transform-origin:left; animation: spin 2s linear infinite;"></div>
      ${words.map((w, i) => {
    let x = Math.random() * 200 + 50;
    let y = Math.random() * 200 + 50;
    return `<div class="radar-point" data-word="${w}" style="position:absolute; top:${y}px; left:${x}px; color:#00ff55; font-size:12px; opacity:0; cursor:pointer;" onclick="checkPing('${w}')">
          <div style="width:10px;height:10px;background:#00ff55;border-radius:50%;margin-bottom:2px;"></div>
          ${w}
        </div>`;
  }).join('')}
    </div>
    <style>
      @keyframes spin { 100% { transform: rotate(360deg); } }
      .ping-anim { animation: pingfade 2s ease-out; }
      @keyframes pingfade { 0% { opacity: 1; transform:scale(1.5);} 100% { opacity: 0; transform:scale(1);} }
    </style>
  `;

  setInterval(() => {
    let points = container.querySelectorAll(".radar-point");
    points.forEach(p => {
      p.classList.remove("ping-anim");
      void p.offsetWidth;
      p.classList.add("ping-anim");
    });
  }, 2000);

  window.checkPing = (w) => {
    if (w === anomaly) closeStationModal(true);
    else makeMistake();
  };
}

// 4. Pipes logic (Simplified matching)
function buildPipeGame(container) {
  const qList = [{ w: "Açık", a: "Kapalı", o: ["Soğuk", "Kapalı", "Uzak"] }];
  let q = qList[0];
  container.innerHTML = `
    <p>GAZ VANALARI: <b>${q.w}</b> durumuna ZIT olan vanayı çevirerek sızıntıyı durdur:</p>
    <div style="display:flex; justify-content:center; gap:20px; margin-top:30px;">
       ${q.o.sort(() => Math.random() - 0.5).map(opt => `
         <div style="text-align:center; cursor:pointer;" onclick="clkVana('${opt}', this)">
           <div class="vana-wheel" style="width:80px; height:80px; border:4px dashed #00ffcc; border-radius:50%; margin:0 auto; display:flex; align-items:center; justify-content:center; font-size:40px; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); background:rgba(0,255,150,0.1);">⚙️</div>
           <b style="color:white; display:block; margin-top:10px; font-family:monospace;">${opt}</b>
         </div>
       `).join('')}
    </div>
  `;
  window.clkVana = (opt, el) => {
    let wheel = el.querySelector(".vana-wheel");
    wheel.style.transform = "rotate(360deg)";
    setTimeout(() => {
      if (opt === q.a) closeStationModal(true);
      else { makeMistake(); wheel.style.transform = "rotate(0)"; }
    }, 500);
  };
}

function buildBiologyGame(c) {
  c.innerHTML = `
    <div style="text-align:center; user-select:none;">
      <p>DNA ANALİZİ: Alyuvar hücresini kapıp <b>Analiz Tüpü</b>'ne bırak!</p>
      
      <div id="microscope-area" style="position:relative; width:250px; height:250px; background:#000; border:5px solid #00ffcc; border-radius:50%; margin:20px auto; overflow:visible;">
        <div id="red-cell" style="position:absolute; width:40px; height:40px; background:#ff4444; border-radius:50%; left:30px; top:100px; cursor:grab; box-shadow:0 0 15px #ff0000; z-index:100; touch-action:none;"></div>
        
        <div style="position:absolute; width:30px; height:30px; background:#ffffff; border-radius:50%; left:150px; top:40px; opacity:0.3;"></div>
        <div style="position:absolute; width:35px; height:35px; background:#ffffff; border-radius:50%; left:100px; top:180px; opacity:0.3;"></div>
      </div>

      <div id="dna-target" style="width:120px; height:60px; border:3px dashed #00ffcc; margin:30px auto; display:flex; align-items:center; justify-content:center; color:#00ffcc; font-weight:bold; border-radius:10px;">ANALİZ TÜPÜ</div>
    </div>
  `;

  const cell = document.getElementById("red-cell");
  const target = document.getElementById("dna-target");
  const area = document.getElementById("microscope-area");

  cell.onmousedown = (e) => {
    // Sürükleme başladığında hücrenin o anki konumunu al
    const startX = e.clientX;
    const startY = e.clientY;
    const initialLeft = cell.offsetLeft;
    const initialTop = cell.offsetTop;

    cell.style.cursor = "grabbing";

    const move = (em) => {
      // Mouse ne kadar hareket etti?
      const dx = em.clientX - startX;
      const dy = em.clientY - startY;

      // Yeni konum = ilk konum + fare hareket miktarı
      cell.style.left = (initialLeft + dx) + "px";
      cell.style.top = (initialTop + dy) + "px";
    };

    const up = (eu) => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      cell.style.cursor = "grab";

      const tRect = target.getBoundingClientRect();
      const cRect = cell.getBoundingClientRect();

      // Çarpışma Testi: Hücrenin merkezi hedef kutunun içinde mi?
      const cellCenterX = cRect.left + cRect.width / 2;
      const cellCenterY = cRect.top + cRect.height / 2;

      if (cellCenterX > tRect.left && cellCenterX < tRect.right &&
        cellCenterY > tRect.top && cellCenterY < tRect.bottom) {

        cell.style.background = "#00ffcc";
        cell.style.boxShadow = "0 0 20px #00ffcc";

        // Başarı durumunda fonksiyonu çağır
        if (typeof closeStationModal === 'function') {
          setTimeout(() => closeStationModal(true), 500);
        } else {
          alert("Analiz Başarılı!");
        }
      } else {
        // Hedefe girmediyse başlangıca dön (İsteğe bağlı)
        cell.style.left = "30px";
        cell.style.top = "100px";
      }
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };
}

function buildMemoryGame(c) {
  let code = Math.floor(Math.random() * 9000 + 1000);
  c.innerHTML = `
    <p>NAVİGASYON KİLİDİ: Hafızandaki kodu dijital panelle gir!</p>
    <div style="text-align:center;">
        <h1 id="nav-code-display" style="color:#00ffcc; letter-spacing:10px; font-family:monospace;">${code}</h1>
        <div id="nav-pad" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; max-width:150px; margin:20px auto; display:none;">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => `<button class="btn btn-outline" style="padding:10px;" onclick="pressNav('${n}')">${n}</button>`).join('')}
            <button class="btn btn-primary" style="grid-column: span 2;" onclick="checkNav()">GİR</button>
        </div>
        <div id="nav-input-val" style="font-size:32px; color:#fff; height:40px; margin-bottom:10px;"></div>
    </div>
  `;
  let inputVal = "";
  setTimeout(() => {
    document.getElementById("nav-code-display").innerText = "****";
    document.getElementById("nav-pad").style.display = "grid";
  }, 2000);

  window.pressNav = (n) => {
    inputVal += n;
    document.getElementById("nav-input-val").innerText = inputVal;
  };
  window.checkNav = () => {
    if (inputVal == code) closeStationModal(true);
    else { makeMistake(); inputVal = ""; document.getElementById("nav-input-val").innerText = ""; }
  };
}

function buildSortingGame(c) {
  // İçeriği oluştur
  c.innerHTML = `
    <div class="sorting-game-wrapper" style="user-select:none; font-family:sans-serif; color:white;">
        <p>KARGO DÜZENLEME: Gezegenleri <b>Güneş'e yakınlığa göre</b> (Dünya -> Mars -> Jüpiter) kutuya bırak!</p>
        <div id="orbit-slot" style="height:100px; background:rgba(0,255,204,0.1); border:2px dashed #00ffcc; border-radius:10px; margin-bottom:20px; display:flex; align-items:center; justify-content:center; position:relative;">
            <div style="position:absolute; left:10px; width:30px; height:30px; background:yellow; border-radius:50%; box-shadow:0 0 15px yellow;"></div>
            <span id="slot-text">YÖRÜNGE KUTUSU</span>
        </div>
        <div id="planet-source" style="display:flex; justify-content:center; gap:15px;">
            ${["Dünya", "Mars", "Jüpiter"]
      .sort(() => Math.random() - 0.5)
      .map(p => `<div class="p-item" data-name="${p}" style="padding:10px 20px; background:#333; border:1px solid #fff; border-radius:20px; cursor:grab; touch-action:none; z-index:100;">${p}</div>`)
      .join('')}
        </div>
    </div>`;

  let order = [];
  const items = c.querySelectorAll(".p-item");
  const slot = c.querySelector("#orbit-slot");

  items.forEach(el => {
    el.onmousedown = (e) => {
      // Sürükleme başladığında bir kez hesapla (Donmayı önleyen kısım)
      const initialX = e.clientX;
      const initialY = e.clientY;
      const startRect = el.getBoundingClientRect();

      el.style.cursor = "grabbing";
      el.style.position = "fixed";
      el.style.width = startRect.width + "px"; // Boyutun bozulmaması için

      // Mouse Takip Fonksiyonu (Optimize edildi)
      const move = (em) => {
        const dx = em.clientX - initialX;
        const dy = em.clientY - initialY;
        // Transform kullanmak "top/left" değiştirmekten çok daha akıcıdır
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      };

      const up = (eu) => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);

        const sRect = slot.getBoundingClientRect();
        const pRect = el.getBoundingClientRect();

        // Çakışma kontrolü (Kutunun içine bırakıldı mı?)
        if (pRect.left < sRect.right && pRect.right > sRect.left &&
          pRect.top < sRect.bottom && pRect.bottom > sRect.top) {

          order.push(el.dataset.name);
          el.style.visibility = "hidden"; // display:none yerine düzen bozulmasın diye

          if (order.length === 3) {
            if (JSON.stringify(order) === JSON.stringify(["Dünya", "Mars", "Jüpiter"])) {
              alert("Tebrikler! Yörünge dizildi."); // Buraya kendi success fonksiyonunu yaz
              if (typeof closeStationModal === 'function') closeStationModal(true);
            } else {
              alert("Hatalı sıralama! Tekrar dene.");
              buildSortingGame(c); // Oyunu sıfırla
            }
          }
        } else {
          // Kutunun dışına bırakılırsa geri dön
          el.style.position = "static";
          el.style.transform = "none";
          el.style.cursor = "grab";
        }
      };

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    };
  });
}

function buildOddOutGame(c) {
  c.innerHTML = `
    <p>GÜVENLİK ANOMALİSİ: Kameralardan sızan <b>gezegen olmayan</b> cismi seç!</p>
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:20px;">
        <div style="padding:20px; background:#000; border:2px solid #555; text-align:center; cursor:pointer;" onclick="makeMistake()">CAM 01: Merkür</div>
        <div style="padding:20px; background:#000; border:2px solid #00ffcc; text-align:center; cursor:pointer; box-shadow:0 0 10px #00ffcc;" onclick="closeStationModal(true)">CAM 02: AY (Uydu)</div>
        <div style="padding:20px; background:#000; border:2px solid #555; text-align:center; cursor:pointer;" onclick="makeMistake()">CAM 03: Venüs</div>
        <div style="padding:20px; background:#000; border:2px solid #555; text-align:center; cursor:pointer;" onclick="makeMistake()">CAM 04: Mars</div>
    </div>
  `;
}

function buildSimonGame(container) {
  let seq = []; for (let i = 0; i < 4; i++) seq.push(Math.floor(Math.random() * 4));
  let uSeq = [];
  container.innerHTML = `
    <p>REAKTÖR SOĞUTMA: Yanıp sönen 3D tüpleri aynı sırayla aktifleştir!</p>
    <div style="display:flex; gap:20px; justify-content:center; margin:20px 0;">
      <div id="sm0" class="simon-tube" style="width:50px;height:120px;background:linear-gradient(to right, #300, #900, #300); border-radius:25px; border:2px solid #555; cursor:pointer;"></div>
      <div id="sm1" class="simon-tube" style="width:50px;height:120px;background:linear-gradient(to right, #030, #090, #030); border-radius:25px; border:2px solid #555; cursor:pointer;"></div>
      <div id="sm2" class="simon-tube" style="width:50px;height:120px;background:linear-gradient(to right, #003, #009, #003); border-radius:25px; border:2px solid #555; cursor:pointer;"></div>
      <div id="sm3" class="simon-tube" style="width:50px;height:120px;background:linear-gradient(to right, #330, #990, #330); border-radius:25px; border:2px solid #555; cursor:pointer;"></div>
    </div>
    <button class="btn btn-primary" id="simon-go">SIRAYI GÖSTER</button>
  `;
  document.getElementById("simon-go").onclick = () => {
    document.getElementById("simon-go").style.display = "none";
    let step = 0;
    let iv = setInterval(() => {
      if (step >= 4) { clearInterval(iv); return; }
      let t = document.getElementById("sm" + seq[step]);
      let old = t.style.background;
      t.style.background = "#fff";
      t.style.boxShadow = "0 0 30px #fff";
      setTimeout(() => { t.style.background = old; t.style.boxShadow = "none"; }, 400);
      step++;
    }, 800);
  };
  for (let i = 0; i < 4; i++) {
    document.getElementById("sm" + i).onclick = () => {
      uSeq.push(i);
      document.getElementById("sm" + i).style.border = "4px solid #fff";
      setTimeout(() => document.getElementById("sm" + i).style.border = "2px solid #555", 200);
      if (uSeq[uSeq.length - 1] !== seq[uSeq.length - 1]) { makeMistake(); uSeq = []; }
      else if (uSeq.length === 4) closeStationModal(true);
    };
  }
}
