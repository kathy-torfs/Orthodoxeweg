// -----------------------------
// springspel.js
// -----------------------------

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.7; // 70% hoogte
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// -----------------------------
// Assets
// -----------------------------
const photeinosImg = new Image();
photeinosImg.src = "https://kathy-torfs.github.io/Orthodoxeweg/images/photeinos_walk.png";

const levelBackgrounds = [
  "https://kathy-torfs.github.io/Orthodoxeweg/images/level1.png",
  "https://kathy-torfs.github.io/Orthodoxeweg/images/level2.png",
  "https://kathy-torfs.github.io/Orthodoxeweg/images/level3.png",
  "https://kathy-torfs.github.io/Orthodoxeweg/images/level4.png",
  "https://kathy-torfs.github.io/Orthodoxeweg/images/level5.png"
].map(src => { const i = new Image(); i.src = src; return i; });

const collectableImgs = [
  "https://kathy-torfs.github.io/Orthodoxeweg/images/duif.png",
  "https://kathy-torfs.github.io/Orthodoxeweg/images/vleugel.png",
  "https://kathy-torfs.github.io/Orthodoxeweg/images/engel.png"
].map(src => { const i = new Image(); i.src = src; return i; });

// -----------------------------
// Speler (Photeinos)
// -----------------------------
const photeinos = {
  x: 50, y: 0, w: 60, h: 60,
  vy: 0, onGround: false
};
let speed = 5;
let gravity = 1;
let jumpPower = -15;

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
// Input
// -----------------------------
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// -----------------------------
// Obstakels
// -----------------------------
function spawnObstacle() {
  const h = 40;
  obstacles.push({
    x: canvas.width,
    y: canvas.height - h,
    w: 40, h: h
  });
}

// -----------------------------
// Collectables
// -----------------------------
function spawnCollectable() {
  const img = collectableImgs[Math.floor(Math.random()*collectableImgs.length)];
  const y = Math.random() * (canvas.height - 200) + 100;
  collectables.push({
    x: canvas.width,
    y: y,
    w: 40, h: 40,
    img: img
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

  // Obstacles bewegen (naar links schuiven, maar vast op grond)
  obstacles.forEach(o => o.x -= 4);
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  // Collectables bewegen
  collectables.forEach(c => c.x -= 2);
  collectables = collectables.filter(c => c.x + c.w > 0);

  // Check collisions
  for (const o of obstacles) {
    if (rectsOverlap(photeinos, o)) {
      running = false;
      alert("Botsing! Game Over.");
      return;
    }
  }

  for (let i=collectables.length-1; i>=0; i--) {
    const c = collectables[i];
    if (rectsOverlap(photeinos, c)) {
      score++;
      collectables.splice(i,1);
      alert("Vraag uit vragen.js!"); // hier roep je je vraaglogica aan
    }
  }
}

// -----------------------------
// Draw loop
// -----------------------------
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // achtergrond
  ctx.drawImage(levelBackgrounds[currentLevel], 0, 0, canvas.width, canvas.height);

  // speler
  ctx.drawImage(photeinosImg, photeinos.x, photeinos.y, photeinos.w, photeinos.h);

  // obstakels
  ctx.fillStyle = "brown";
  obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));

  // collectables
  collectables.forEach(c => ctx.drawImage(c.img, c.x, c.y, c.w, c.h));

  // score
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
  // hier Firebase punten -20
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
