// ============================= 
// springspel.js
// =============================

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = document.getElementById("gameContainer").clientWidth;
  canvas.height = document.getElementById("gameContainer").clientHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// -----------------------------
// Speler (Photeinos)
// -----------------------------
const photeinos = { x: 50, y: 0, w: 50, h: 50, vy: 0, onGround: false };
let speed = 6;
let gravity = 1;
let jumpPower = -18;

// -----------------------------
// Game variabelen
// -----------------------------
let currentLevel = 0;
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
const bandHeight = 100;
let bandY = 0; 
function updateBandY() {
  bandY = canvas.height - bandHeight - 50;
}
updateBandY();
window.addEventListener("resize", updateBandY);

// -----------------------------
// Input toetsenbord
// -----------------------------
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// -----------------------------
// Input tablet (touch)
// -----------------------------
let touchStartX = null;
let touchStartY = null;

canvas.addEventListener("touchstart", e => {
  if (!running) return;
  e.preventDefault();
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;

  // Tik = springen
  if (photeinos.onGround) {
    photeinos.vy = jumpPower;
    photeinos.onGround = false;
  }
});

canvas.addEventListener("touchmove", e => {
  if (!running) return;
  e.preventDefault();
  const touch = e.touches[0];
  const dx = touch.clientX - touchStartX;

  if (dx > 40) { 
    photeinos.x += speed; // veeg rechts
    touchStartX = touch.clientX;
  }
  if (dx < -40) { 
    photeinos.x -= speed; // veeg links
    touchStartX = touch.clientX;
  }
});

// -----------------------------
// Obstakels (💀)
// -----------------------------
function spawnObstacle() {
  const h = 60;
  obstacles.push({
    x: canvas.width,
    y: canvas.height - h,
    w: 50, h: h
  });
}

// -----------------------------
// Collectables (🪽)
// -----------------------------
function spawnCollectable() {
  collectables.push({
    x: canvas.width,
    y: bandY + 20,
    w: 40, h: 40
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

  if (photeinos.y + photeinos.h > canvas.height) {
    photeinos.y = canvas.height - photeinos.h;
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

  // Band laten schuiven
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
      alert("Botsing! Game Over.");
      return;
    }
  }

  // Botsing collectables
  for (let i = collectables.length - 1; i >= 0; i--) {
    const c = collectables[i];
    if (rectsOverlap(photeinos, c)) {
      score++;
      collectables.splice(i,1);
      alert("🪽 Je hebt een vleugel gevangen!");
    }
  }
}

// -----------------------------
// Draw loop
// -----------------------------
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Band tekenen
  ctx.fillStyle = "rgba(200,200,200,0.2)";
  ctx.fillRect(bandX, bandY, canvas.width, bandHeight);
  ctx.fillRect(bandX + canvas.width, bandY, canvas.width, bandHeight);

  // Obstakels (💀)
  ctx.font = "40px Arial";
  obstacles.forEach(o => ctx.fillText("💀", o.x, o.y));

  // Collectables (🪽)
  ctx.font = "36px Arial";
  collectables.forEach(c => ctx.fillText("🪽", c.x, c.y));

  // Speler ⭐
  ctx.font = "42px Arial";
  ctx.fillText("⭐", photeinos.x, photeinos.y);

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
  obstacles = [];
  collectables = [];
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
setInterval(() => { if(running && !paused) spawnObstacle(); }, 4000);
setInterval(() => { if(running && !paused) spawnCollectable(); }, 3000);
