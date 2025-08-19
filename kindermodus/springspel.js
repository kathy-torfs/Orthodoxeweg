// =========================
// Springspel.js – Orthodoxeweg
// =========================

// ---- Canvas ----
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ---- Afbeeldingen (hardcoded links naar GitHub) ----
const backgroundImg = new Image();
backgroundImg.src = "https://kathy-torfs.github.io/Orthodoxeweg/images/level1.png";

const photeinosImg = new Image();
photeinosImg.src = "https://kathy-torfs.github.io/Orthodoxeweg/images/photeinos_walk.png";

// ---- Speler (Photeinos) ----
const photeinos = {
  x: 50,
  y: 0,
  w: 60,
  h: 60,
  vy: 0,
  onGround: false
};

// ---- Controls ----
const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// ---- Physics ----
const gravity = 0.8;
const jumpPower = -15;
const speed = 5;

// ---- Update speler ----
function updatePlayer() {
  if (keys["ArrowRight"]) photeinos.x += speed;
  if (keys["ArrowLeft"]) photeinos.x -= speed;
  if (keys["Space"] && photeinos.onGround) {
    photeinos.vy = jumpPower;
    photeinos.onGround = false;
  }

  // zwaartekracht
  photeinos.vy += gravity;
  photeinos.y += photeinos.vy;

  // vloer = onderkant canvas
  if (photeinos.y + photeinos.h > canvas.height) {
    photeinos.y = canvas.height - photeinos.h;
    photeinos.vy = 0;
    photeinos.onGround = true;
  }
}

// ---- Teken speler ----
function drawPlayer() {
  ctx.drawImage(photeinosImg, photeinos.x, photeinos.y, photeinos.w, photeinos.h);
}

// ---- Game loop ----
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // achtergrond
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

  // speler
  updatePlayer();
  drawPlayer();

  requestAnimationFrame(gameLoop);
}

// ---- Start ----
backgroundImg.onload = () => {
  gameLoop();
};
