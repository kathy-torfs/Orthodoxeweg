// ---- Canvas setup ----
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Canvas automatisch aanpassen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 60; // plaats voor header
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ---- Speler (Photeinos) ----
const photeinosImg = new Image();
photeinosImg.src = "https://kathy-torfs.github.io/Orthodoxeweg/images/photeinos_walk.png";

const photeinos = {
  x: 50, y: 0, w: 60, h: 60,
  vy: 0, onGround: false
};

// ---- Besturing ----
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// ---- Spel physics ----
const gravity = 0.8;
const jumpPower = -15;
const speed = 6;

// ---- Update speler ----
function updatePlayer() {
  if (keys["ArrowRight"]) photeinos.x += speed;
  if (keys["ArrowLeft"]) photeinos.x -= speed;
  if (keys[" "] && photeinos.onGround) { // spatie
    photeinos.vy = jumpPower;
    photeinos.onGround = false;
  }

  photeinos.vy += gravity;
  photeinos.y += photeinos.vy;

  // Botsing met de "grond"
  if (photeinos.y + photeinos.h > canvas.height) {
    photeinos.y = canvas.height - photeinos.h;
    photeinos.vy = 0;
    photeinos.onGround = true;
  }
}

// ---- Teken achtergrond ----
function drawBackground() {
  ctx.fillStyle = "#f0e4d7"; // zandkleur
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ---- Teken speler ----
function drawPlayer() {
  ctx.drawImage(photeinosImg, photeinos.x, photeinos.y, photeinos.w, photeinos.h);
}

// ---- Game loop ----
function gameLoop() {
  drawBackground();
  updatePlayer();
  drawPlayer();

  requestAnimationFrame(gameLoop);
}

// Start loop als afbeelding geladen is
photeinosImg.onload = () => {
  gameLoop();
};
