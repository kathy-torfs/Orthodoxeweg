// =============================
// springspel.js
// =============================

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

// -----------------------------
// Assets
// -----------------------------
const photeinosImg = new Image();
photeinosImg.src = "https://kathy-torfs.github.io/Orthodoxeweg/images/photeinos_walk.png";

const OBSTACLES = {
  licht: "🪽",
  zonde: "💀"
};
const FLOWERS = ["🌷","🌻","🌼","🌸","🌹","🌺","🌿","🍀"];

// -----------------------------
// Gras & speler
// -----------------------------
let grassHeight = canvas.height / 4;
let grassTop = canvas.height - grassHeight;

const photeinos = { 
  x: 100, 
  y: grassTop - 20,  // netjes op gras
  w: 60, 
  h: 60, 
  vy: 0, 
  jumping: false 
};

// -----------------------------
// Game variabelen
// -----------------------------
let currentLevel = 0;
let obstacles = [];
let keys = {};
let score = 0;
let running = false;
let paused = false;

// -----------------------------
// Achtergrond state
// -----------------------------
let clouds = [];
let flowers = [];

function makeClouds(count = 6) {
  clouds = [];
  for (let i = 0; i < count; i++) {
    clouds.push({
      x: Math.random() * canvas.width,
      y: 30 + Math.random() * 80,
      size: 20 + Math.random() * 20
    });
  }
}
function makeFlowers(count = 15) {
  flowers = [];
  for (let i = 0; i < count; i++) {
    flowers.push({
      x: Math.random() * canvas.width,
      glyph: FLOWERS[Math.floor(Math.random()*FLOWERS.length)]
    });
  }
}
makeClouds();
makeFlowers();

// -----------------------------
// Input
// -----------------------------
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Touch controls (tablet)
canvas.addEventListener("touchstart", () => jump());

// -----------------------------
// Speed per level
// -----------------------------
function speedForLevel(level) {
  const base = 2;
  const perLevel = 0.6;
  return base + level * perLevel;
}

// -----------------------------
// Obstakels
// -----------------------------
function spawnObstacle() {
  const soort = Math.random() < 0.7 ? "licht" : "zonde";
  const inGras = Math.random() < 0.5;

  obstacles.push({
    x: canvas.width,
    y: inGras ? grassTop - 20 : grassTop - 120,
    w: 40, h: 40,
    soort: soort,
    inGras: inGras,
    actief: true
  });
}

// -----------------------------
// Jump functie
// -----------------------------
function jump() {
  if (!photeinos.jumping) {
    photeinos.vy = -14;
    photeinos.jumping = true;
  }
}

// -----------------------------
// Player update
// -----------------------------
function updatePlayer() {
  if (keys[" "] || keys["ArrowUp"]) jump();

  photeinos.vy += 0.8; // zwaartekracht
  photeinos.y += photeinos.vy;

  // op gras landen
  if (photeinos.y + photeinos.h > grassTop) {
    photeinos.y = grassTop - photeinos.h;
    photeinos.vy = 0;
    photeinos.jumping = false;
  }
}

// -----------------------------
// Collision check
// -----------------------------
function collisionCheck(ob) {
  const xHit = photeinos.x < ob.x + ob.w && photeinos.x + photeinos.w > ob.x;
  if (!xHit) return false;

  if (ob.inGras) {
    return !photeinos.jumping; // geraakt als je niet springt
  } else {
    return photeinos.jumping;  // geraakt als je wel springt
  }
}

// -----------------------------
// Update loop
// -----------------------------
function update() {
  if (!running || paused) return;

  updatePlayer();
  const spd = speedForLevel(currentLevel);

  obstacles.forEach(o => o.x -= spd);
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    if (o.actief && collisionCheck(o)) {
      if (o.soort === "licht") {
        score++;
        alert("Licht-vraag!");
      } else {
        alert("Zonde-vraag!");
      }
      o.actief = false;
    }
  }
}

// -----------------------------
// Draw loop
// -----------------------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // lucht
  ctx.fillStyle = "#aee7ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // wolken
  ctx.font = "24px Arial";
  clouds.forEach(c => {
    ctx.fillText("☁️", c.x, c.y);
    c.x -= 0.5;
    if (c.x < -30) c.x = canvas.width + 20;
  });

  // gras
  ctx.fillStyle = "#8BC34A";
  ctx.fillRect(0, grassTop, canvas.width, grassHeight);

  // bloemen
  ctx.font = "20px Arial";
  flowers.forEach(f => {
    ctx.fillText(f.glyph, f.x, grassTop + 20);
    f.x -= 1;
    if (f.x < -20) f.x = canvas.width + 20;
  });

  // obstakels
  ctx.font = "30px Arial";
  obstacles.forEach(o => ctx.fillText(OBSTACLES[o.soort], o.x, o.y));

  // speler
  ctx.drawImage(photeinosImg, photeinos.x, photeinos.y, photeinos.w, photeinos.h);

  // score
  ctx.fillStyle = "black";
  ctx.font = "18px Comic Sans MS";
  ctx.fillText("Score: " + score, 20, 25);
}

// -----------------------------
// Main loop
// -----------------------------
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();

// -----------------------------
// Controls: start/pauze
// -----------------------------
const startBtn = document.createElement("button");
startBtn.innerText = "Start spel (-20 punten)";
startBtn.style.position = "absolute";
startBtn.style.top = "80px";
startBtn.style.right = "20px";
document.body.appendChild(startBtn);

startBtn.onclick = () => {
  running = true;
  score = 0;
  currentLevel = 0;
  obstacles = [];
  photeinos.y = grassTop - photeinos.h; // reset startpositie
};

const pauseBtn = document.createElement("button");
pauseBtn.innerText = "Pauze";
pauseBtn.style.position = "absolute";
pauseBtn.style.top = "120px";
pauseBtn.style.right = "20px";
document.body.appendChild(pauseBtn);

pauseBtn.onclick = () => { paused = !paused; };

// -----------------------------
// Spawners
// -----------------------------
setInterval(() => { if(running && !paused) spawnObstacle(); }, 3000);
