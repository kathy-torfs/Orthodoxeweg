// ---- Canvas setup ----
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.8; // 80% hoogte
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ---- Afbeeldingen ----
const backgrounds = [
  "images/level1.png",
  "images/level2.png",
  "images/level3.png",
  "images/level4.png",
  "images/level5.png"
].map(src => {
  const img = new Image();
  img.src = src;
  return img;
});

const photeinosImg = new Image();
photeinosImg.src = "images/photeinos_walk.png";

// ---- Speler ----
const photeinos = {
  x: 50,
  y: 0,
  w: 60,
  h: 60,
  vy: 0,
  onGround: false
};

const gravity = 0.8;
const jumpPower = -14;
const speed = 5;

// ---- Obstakels ----
let obstakels = [];

// ---- Collectables ----
let collectables = [];
let score = 0;

// ---- Levels ----
let level = 0; // start op level1.png
let collectedInLevel = 0;
const maxCollect = 10; // aantal collectables nodig voor volgende level

// ---- Input ----
const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// ---- Player update ----
function updatePlayer() {
  if (keys["ArrowRight"]) photeinos.x += speed;
  if (keys["ArrowLeft"]) photeinos.x -= speed;
  if (keys["Space"] && photeinos.onGround) {
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

// ---- Obstakels update ----
function updateObstakels() {
  obstakels.forEach(o => {
    o.x -= 4; // snelheid obstakels
  });
  obstakels = obstakels.filter(o => o.x + o.w > 0);

  // Nieuwe obstakels
  if (Math.random() < 0.02) {
    obstakels.push({
      x: canvas.width,
      y: canvas.height - 40,
      w: 40,
      h: 40
    });
  }

  // Collision check
  obstakels.forEach(o => {
    if (checkCollision(photeinos, o)) {
      alert("Je botste tegen een obstakel! Probeer opnieuw.");
      resetGame();
    }
  });
}

// ---- Collectables update ----
function updateCollectables() {
  collectables.forEach(c => {
    c.x -= 4; // naar links bewegen
  });
  collectables = collectables.filter(c => c.x + c.w > 0);

  // Nieuwe collectable
  if (Math.random() < 0.03) {
    collectables.push({
      x: canvas.width,
      y: Math.random() * (canvas.height - 200) + 100, // variabele hoogte
      w: 30,
      h: 30
    });
  }

  // Collision check
  collectables.forEach((c, i) => {
    if (checkCollision(photeinos, c)) {
      score++;
      collectedInLevel++;
      collectables.splice(i, 1);

      if (collectedInLevel >= maxCollect) {
        nextLevel();
      }
    }
  });
}

// ---- Collision ----
function checkCollision(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

// ---- Level wisselen ----
function nextLevel() {
  level++;
  collectedInLevel = 0;

  if (level >= backgrounds.length) {
    alert("Proficiat! Je hebt alle levels gehaald!");
    resetGame();
  } else {
    // vraag tonen bij overgang
    if (window.vragen && vragen.length > 0) {
      const v = vragen[Math.floor(Math.random() * vragen.length)];
      alert("Vraag: " + v.vraag + "\nA: " + v.antwoorden.join(" / "));
    }
  }
}

// ---- Reset game ----
function resetGame() {
  level = 0;
  score = 0;
  collectedInLevel = 0;
  obstakels = [];
  collectables = [];
  photeinos.x = 50;
  photeinos.y = 0;
}

// ---- Teken functies ----
function drawBackground() {
  const bg = backgrounds[level];
  if (bg.complete) {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#cce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawPlayer() {
  ctx.drawImage(photeinosImg, photeinos.x, photeinos.y, photeinos.w, photeinos.h);
}

function drawObstakels() {
  ctx.fillStyle = "brown";
  obstakels.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));
}

function drawCollectables() {
  ctx.fillStyle = "gold";
  collectables.forEach(c => ctx.beginPath() && ctx.arc(c.x, c.y, 15, 0, Math.PI * 2) && ctx.fill());
}

function drawScore() {
  ctx.fillStyle = "#333";
  ctx.font = "20px Comic Sans MS";
  ctx.fillText("Score: " + score, 20, 30);
}

// ---- Game loop ----
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  updatePlayer();
  updateObstakels();
  updateCollectables();

  drawPlayer();
  drawObstakels();
  drawCollectables();
  drawScore();

  requestAnimationFrame(gameLoop);
}

// ---- Start ----
resetGame();
gameLoop();
