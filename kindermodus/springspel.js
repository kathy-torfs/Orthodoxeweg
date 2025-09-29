// =============================
// springspel.js
// =============================

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const container = document.getElementById("gameContainer");
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
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
const photeinos = { x: 50, y: 0, w: 80, h: 80, vy: 0, onGround: false };
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
// Input
// -----------------------------
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// -----------------------------
// Obstakels
// -----------------------------
function spawnObstacle() {
  const h = 60;
  obstacles.push({
    x: canvas.width,
    y: canvas.height - h,
    w: 60, h: h
  });
}

// -----------------------------
// Collectables
// -----------------------------
function spawnCollectable() {
  const img = collectableImgs[Math.floor(Math.random()*collectableImgs.length)];
  collectables.push({
    x: canvas.width,
    y: bandY + 20,
    w: 50, h: 50,
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

      if (typeof vragen !== "undefined") {
        const config = levelVraagConfig[currentLevel] || { diff: 1, antwoorden: 4 };
        const keuzes = vragen.filter(v => v.difficulty === config.diff);
        const q = keuzes[Math.floor(Math.random()*keuzes.length)];

        let tekst = q.q + "\n\n";
        let opties = q.a;
        if (config.antwoorden) {
          opties = opties.slice(0, config.antwoorden);
        }
        opties.forEach((ans, idx) => { tekst += (idx+1) + ". " + ans + "\n"; });

        alert(tekst);
      }
    }
  }
}

// -----------------------------
// Draw loop
// -----------------------------
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.drawImage(levelBackgrounds[currentLevel], 0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(200,200,200,0.2)";
  ctx.fillRect(bandX, bandY, canvas.width, bandHeight);
  ctx.fillRect(bandX + canvas.width, bandY, canvas.width, bandHeight);

  collectables.forEach(c => ctx.drawImage(c.img, c.x, c.y, c.w, c.h));

  ctx.fillStyle = "brown";
  obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));

  ctx.drawImage(photeinosImg, photeinos.x, photeinos.y, photeinos.w, photeinos.h);

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

// -----------------------------
// Config voor vragen per level
// -----------------------------
const levelVraagConfig = {
  0: { diff: 1, antwoorden: 3 }, // level 1
  1: { diff: 1, antwoorden: 4 }, // level 2
  2: { diff: 2, antwoorden: 3 }, // level 3
  3: { diff: 2, antwoorden: 4 }, // level 4
  4: { diff: 3, antwoorden: null } // level 5
};
