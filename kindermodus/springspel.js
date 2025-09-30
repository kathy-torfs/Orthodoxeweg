// =============================
// springspel.js (met hogere sprong + echte vragen)
// =============================

//nota// Canvas ophalen
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

// -----------------------------
// Afmetingen & zones
// -----------------------------
const ZONE_H = canvas.height / 2;   // 200px bij hoogte 400
const grassTop = canvas.height - ZONE_H; // 200px

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
// Speler (Photeinos)
// -----------------------------
const photeinos = { 
  x: 100, 
  w: ZONE_H / 2, 
  h: ZONE_H / 2, 
  y: canvas.height - (ZONE_H / 2), 
  vy: 0, 
  jumping: false 
};

// -----------------------------
// Game variabelen
// -----------------------------
let obstacles = [];
let keys = {};
let score = 0;
let running = false;
let paused = false;

// -----------------------------
// Achtergrond
// -----------------------------
let clouds = [];
let flowers = [];

function makeClouds(count = 6) {
  clouds = [];
  for (let i = 0; i < count; i++) {
    clouds.push({
      x: Math.random() * canvas.width,
      y: 20 + Math.random() * 80
    });
  }
}

function makeFlowers(count = 15) {
  flowers = [];
  for (let i = 0; i < count; i++) {
    flowers.push({
      x: Math.random() * canvas.width,
      y: grassTop + 20 + Math.random() * (ZONE_H - 30),
      glyph: FLOWERS[Math.floor(Math.random() * FLOWERS.length)]
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
canvas.addEventListener("touchstart", () => jump());

// -----------------------------
// Snelheid
// -----------------------------
function speedForLevel() {
  return 1.2; // rustig
}

// -----------------------------
// Obstakels
// -----------------------------
function spawnObstacle() {
  const soort = Math.random() < 0.7 ? "licht" : "zonde";
  const inGras = Math.random() < 0.5;

  obstacles.push({
    x: canvas.width,
    y: inGras 
        ? canvas.height - 50   
        : grassTop - 50,       
    w: ZONE_H / 4,
    h: ZONE_H / 4,
    soort: soort,
    inGras: inGras,
    actief: true
  });
}

// -----------------------------
// Springen
// -----------------------------
function jump() {
  if (!photeinos.jumping) {
    photeinos.vy = -20; // hogere sprong
    photeinos.jumping = true;
  }
}

// -----------------------------
// Player update
// -----------------------------
function updatePlayer() {
  if (keys[" "]) jump();

  photeinos.vy += 0.6; // minder zwaartekracht
  photeinos.y += photeinos.vy;

  const groundY = canvas.height - photeinos.h;
  if (photeinos.y > groundY) {
    photeinos.y = groundY;
    photeinos.vy = 0;
    photeinos.jumping = false;
  }
}

// -----------------------------
// Collision
// -----------------------------
function collisionCheck(ob) {
  const xHit = photeinos.x < ob.x + ob.w && photeinos.x + photeinos.w > ob.x;
  const yHit = photeinos.y < ob.y + ob.h && photeinos.y + photeinos.h > ob.y;
  return xHit && yHit;
}

// -----------------------------
// Update loop
// -----------------------------
function update() {
  if (!running || paused) return;

  updatePlayer();
  const spd = speedForLevel();

  obstacles.forEach(o => o.x -= spd);
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    if (o.actief && collisionCheck(o)) {
      paused = true;

      let vraag;
      if (o.soort === "licht") {
        vraag = vragen.filter(v => v.type === "licht")[Math.floor(Math.random() * vragen.length)];
      } else {
        vraag = vragen.filter(v => v.type === "zonde")[Math.floor(Math.random() * vragen.length)];
      }

      toonVraag(vraag, o.soort);
      o.actief = false; 
    }
  }
}

// -----------------------------
// Draw
// -----------------------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#aee7ff";
  ctx.fillRect(0, 0, canvas.width, grassTop);

  ctx.fillStyle = "#8BC34A";
  ctx.fillRect(0, grassTop, canvas.width, ZONE_H);

  ctx.font = "20px Arial";
  flowers.forEach(f => {
    ctx.fillText(f.glyph, f.x, f.y);
    f.x -= 0.5;
    if (f.x < -20) f.x = canvas.width + 20;
  });

  ctx.font = "40px Arial";
  obstacles.forEach(o => {
    if (o.actief) ctx.fillText(OBSTACLES[o.soort], o.x, o.y);
  });

  ctx.drawImage(photeinosImg, photeinos.x, photeinos.y, photeinos.w, photeinos.h);

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
// Start/pauze
// -----------------------------
const startBtn = document.createElement("button");
startBtn.innerText = "▶ Start spel (-20 punten)";
startBtn.style.position = "absolute";
startBtn.style.bottom = "30px";
startBtn.style.right = "180px";
document.body.appendChild(startBtn);

startBtn.onclick = () => {
  running = true;
  score = 0;
  obstacles = [];
  photeinos.vy = 0;
  photeinos.jumping = false;
  photeinos.y = canvas.height - photeinos.h;
};

const pauseBtn = document.createElement("button");
pauseBtn.innerText = "⏸ Pauze";
pauseBtn.style.position = "absolute";
pauseBtn.style.bottom = "30px";
pauseBtn.style.right = "30px";
document.body.appendChild(pauseBtn);

pauseBtn.onclick = () => { paused = !paused; };

// -----------------------------
// Spawner
// -----------------------------
setInterval(() => { if(running && !paused) spawnObstacle(); }, 5000);

// -----------------------------
// Vraag overlay
// -----------------------------
function toonVraag(vraag, soort) {
  const overlay = document.getElementById("vraagOverlay");
  const tekst = document.getElementById("vraagTekst");
  const antwoorden = document.getElementById("vraagAntwoorden");

  tekst.textContent = vraag.q;
  antwoorden.innerHTML = "";

  vraag.a.forEach((optie, i) => {
    const btn = document.createElement("button");
    btn.innerText = optie;
    btn.onclick = () => {
      if (i === vraag.correct) {
        score++;
        alert("Goed zo!");
      } else {
        if (soort === "zonde") {
          alert("Dat is fout – Game Over!");
          running = false;
        } else {
          alert("Dat is fout.");
        }
      }
      overlay.style.display = "none";
      paused = false;
    };
    antwoorden.appendChild(btn);
  });

  overlay.style.display = "flex";
}
