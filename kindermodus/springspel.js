// =============================
// springspel.js
// =============================

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
  updateBandY();
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// -----------------------------
// Emoji's
// -----------------------------
const obstacleEmojis = ["💀"];
const collectableEmojis = ["🪽"];

// -----------------------------
// Speler (Photeinos)
// -----------------------------
const photeinos = { x: 60, y: 0, w: 60, h: 60, vy: 0, onGround: false };
let speed = 6;
let gravity = 0.7;
let jumpPower = -12;

// -----------------------------
// Game variabelen
// -----------------------------
let obstacles = [];
let collectables = [];
let keys = {};
let score = 0;
let running = false;
let paused = false;

// -----------------------------
// Band variabelen
// -----------------------------
let bandX = 0;
const bandSpeed = 3;
const bandHeight = 80;
let bandY = 0; 
function updateBandY() {
  bandY = canvas.height - bandHeight - 20;
}

// -----------------------------
// Input
// -----------------------------
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// -----------------------------
// Obstakels
// -----------------------------
function spawnObstacle() {
  const size = 60;
  obstacles.push({
    x: canvas.width,
    y: bandY - size,
    w: size, h: size,
    emoji: "💀"
  });
}

// -----------------------------
// Collectables
// -----------------------------
function spawnCollectable() {
  collectables.push({
    x: canvas.width,
    y: bandY - 120,
    w: 50, h: 50,
    emoji: "🪽"
  });
}

// -----------------------------
// Player update
// -----------------------------
function updatePlayer() {
  if (keys["ArrowRight"]) photeinos.x += speed;
  if (keys["ArrowLeft"]) photeinos.x -= speed;
  if (keys[" "] && photeinos.onGround) {
    photeinos.vy = jumpPower;
    photeinos.onGround = false;
  }

  photeinos.vy += gravity;
  photeinos.y += photeinos.vy;

  if (photeinos.y + photeinos.h > bandY) {
    photeinos.y = bandY - photeinos.h;
    photeinos.vy = 0;
    photeinos.onGround = true;
  }
  if (photeinos.y < 0) {
    photeinos.y = 0;
    photeinos.vy = 0;
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

  // Band schuiven
  bandX -= bandSpeed;
  if (bandX <= -canvas.width) bandX = 0;

  // Obstacles bewegen
  obstacles.forEach(o => o.x -= bandSpeed);
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  // Collectables bewegen
  collectables.forEach(c => c.x -= bandSpeed);
  collectables = collectables.filter(c => c.x + c.w > 0);

  // Botsing obstakels
  for (const o of obstacles) {
    if (rectsOverlap(photeinos, o)) {
      running = false;
      alert("💥 Botsing! Game Over.");
      return;
    }
  }

  // Botsing collectables
  for (let i = collectables.length - 1; i >= 0; i--) {
    const c = collectables[i];
    if (rectsOverlap(photeinos, c)) {
      score++;
      collectables.splice(i,1);
      alert("✨ Je hebt een vleugel gevangen!");
    }
  }
}

// -----------------------------
// Draw loop
// -----------------------------
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Gras-band
  ctx.fillStyle = "lightgreen";
  ctx.fillRect(bandX, bandY, canvas.width, bandHeight);
  ctx.fillRect(bandX + canvas.width, bandY, canvas.width, bandHeight);

  // Obstakels
  ctx.font = "48px Arial";
  obstacles.forEach(o => ctx.fillText(o.emoji, o.x, o.y));

  // Collectables
  ctx.font = "42px Arial";
  collectables.forEach(c => ctx.fillText(c.emoji, c.x, c.y));

  // Speler (Photeinos = blauw blokje voorlopig)
  ctx.fillStyle = "blue";
  ctx.fillRect(photeinos.x, photeinos.y, photeinos.w, photeinos.h);

  // Score
  ctx.fillStyle = "black";
  ctx.font = "20px Comic Sans MS";
  ctx.fillText("Score: " + score, 20, 30);
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
// Controls
// -----------------------------
document.getElementById("startBtn").onclick = () => {
  running = true;
  paused = false;
  score = 0;
  obstacles = [];
  collectables = [];
  photeinos.x = 60;
  photeinos.y = bandY - photeinos.h;
  photeinos.vy = 0;
  photeinos.onGround = true;
};

document.getElementById("pauseBtn").onclick = () => {
  paused = !paused;
};

// -----------------------------
// Spawners
// -----------------------------
setInterval(() => { if(running && !paused) spawnObstacle(); }, 4000);
setInterval(() => { if(running && !paused) spawnCollectable(); }, 3000);
