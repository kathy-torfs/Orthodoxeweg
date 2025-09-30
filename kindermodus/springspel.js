// =============================
// springspel.js
// =============================

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = 800;   // vast formaat binnen kader
  canvas.height = 400;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// -----------------------------
// Assets (emoji's ipv images)
// -----------------------------
const OBSTACLES = {
  licht: "🪽",
  zonde: "💀"
};
const FLOWERS = ["🌷","🌻","🌼","🌸","🌹","🌺","🌿","🍀"];

// -----------------------------
// Speler (Photeinos)
// -----------------------------
const photeinos = { x: 100, y: 300, w: 50, h: 50, vy: 0, onGround: false };
let gravity = 0.8;
let jumpPower = -12;

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
      y: canvas.height - 30 - Math.random() * 20,
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
canvas.addEventListener("touchstart", () => {
  if (photeinos.onGround) {
    photeinos.vy = jumpPower;
    photeinos.onGround = false;
  }
});

// -----------------------------
// Speed per level
// -----------------------------
function speedForLevel(level) {
  const base = 2;      // trage start
  const perLevel = 0.6;
  return base + level * perLevel;
}

// -----------------------------
// Obstakels
// -----------------------------
function spawnObstacle() {
  const soort = Math.random() < 0.7 ? "licht" : "zonde"; // meer vleugels dan doodskoppen
  obstacles.push({
    x: canvas.width,
    y: soort === "licht" ? 250 : 320,
    w: 40, h: 40,
    soort: soort,
    actief: true
  });
}

// -----------------------------
// Player update
// -----------------------------
function updatePlayer() {
  if (keys[" "] && photeinos.onGround) {
    photeinos.vy = jumpPower;
    photeinos.onGround = false;
  }
  if (keys["ArrowUp"] && photeinos.onGround) {
    photeinos.vy = jumpPower;
    photeinos.onGround = false;
  }
  if (keys["ArrowLeft"]) photeinos.x -= 5;
  if (keys["ArrowRight"]) photeinos.x += 5;

  photeinos.vy += gravity;
  photeinos.y += photeinos.vy;

  if (photeinos.y + photeinos.h > canvas.height - 40) {
    photeinos.y = canvas.height - 40 - photeinos.h;
    photeinos.vy = 0;
    photeinos.onGround = true;
  }
}

// -----------------------------
// Collision check
// -----------------------------
function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// -----------------------------
// Update loop
// -----------------------------
function update() {
  if (!running || paused) return;

  updatePlayer();

  const spd = speedForLevel(currentLevel);

  // obstakels bewegen
  obstacles.forEach(o => o.x -= spd);
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  // botsing
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    if (o.actief && rectsOverlap(photeinos, o)) {
      if (o.soort === "licht") {
        score++;
        alert("Vraag (moeilijkheid " + (currentLevel < 2 ? 1 : currentLevel < 4 ? 2 : 3) + ")");
      } else {
        alert("Zonde-vraag!");
      }
      o.actief = false;
    }
  }

  // moeilijkheid omhoog
  if (score > 0 && score % 5 === 0) {
    currentLevel = Math.min(5, currentLevel + 1);
    makeClouds();
    makeFlowers();
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

  // wolkjes
  ctx.font = "24px Arial";
  clouds.forEach(c => {
    ctx.fillText("☁️", c.x, c.y);
    c.x -= 0.5;
    if (c.x < -30) c.x = canvas.width + 20;
  });

  // grasband
  ctx.fillStyle = "#8BC34A";
  ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

  // bloemen
  ctx.font = "20px Arial";
  flowers.forEach(f => {
    ctx.fillText(f.glyph, f.x, f.y);
    f.x -= 1;
    if (f.x < -20) f.x = canvas.width + 20;
  });

  // obstakels
  ctx.font = "30px Arial";
  obstacles.forEach(o => {
    ctx.fillText(OBSTACLES[o.soort], o.x, o.y);
  });

  // speler
  ctx.fillText("⭐", photeinos.x, photeinos.y);

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
