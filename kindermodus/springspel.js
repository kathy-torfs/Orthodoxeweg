// =============================
// springspel.js
// =============================

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Afmetingen
canvas.width = 800;
canvas.height = 500;

// Zones
const zoneHeight = canvas.height / 2; // 50/50
const grassTop = canvas.height - zoneHeight;

// Afmetingen objecten
const phSize = canvas.height * 0.40;  // Photeinos iets groter
const obSize = canvas.height * 0.20;  // Obstakels 20% schermhoogte

// -----------------------------
// Assets
// -----------------------------
const photeinosImg = new Image();
photeinosImg.src = "https://kathy-torfs.github.io/Orthodoxeweg/images/photeinos_walk.png";

const OBSTACLES = {
  licht: "🪽",
  zonde: "💀"
};
const FLOWERS = ["🌷","🌻","🌼","🌸","🌹","🌺"];
const CLOUDS = ["☁️","☁️","☁️"];

// -----------------------------
// Speler
// -----------------------------
const photeinos = {
  x: 100,
  y: canvas.height - phSize,
  w: phSize,
  h: phSize,
  vy: 0,
  jumping: false
};

// -----------------------------
// Game variabelen
// -----------------------------
let obstacles = [];
let score = 0;
let running = false;
let paused = false;
let level = 1;
let vleugels = 0;

// -----------------------------
// Achtergrond
// -----------------------------
let flowers = [];
let clouds = [];

function makeFlowers(count = 15) {
  flowers = [];
  for (let i = 0; i < count; i++) {
    flowers.push({
      x: Math.random() * canvas.width,
      y: grassTop + 20 + Math.random() * (zoneHeight - 40),
      glyph: FLOWERS[Math.floor(Math.random() * FLOWERS.length)]
    });
  }
}
function makeClouds(count = 6) {
  clouds = [];
  for (let i = 0; i < count; i++) {
    clouds.push({
      x: Math.random() * canvas.width,
      y: 30 + Math.random() * (zoneHeight - 60),
      glyph: CLOUDS[Math.floor(Math.random() * CLOUDS.length)]
    });
  }
}
makeFlowers();
makeClouds();

// -----------------------------
// Input
// -----------------------------
document.addEventListener("keydown", e => { if (e.key === " ") jump(); });
canvas.addEventListener("touchstart", () => jump());

// -----------------------------
// Jump
// -----------------------------
function jump() {
  if (!photeinos.jumping) {
    photeinos.vy = -18; // hogere sprong
    photeinos.jumping = true;
  }
}

// -----------------------------
// Obstakels
// -----------------------------
function spawnObstacle() {
  if (obstacles.length >= 2) return; // max 2 tegelijk
  const soort = Math.random() < 0.6 ? "licht" : "zonde";
  const inGras = Math.random() < 0.5;

  obstacles.push({
    x: canvas.width,
    y: inGras ? (grassTop + zoneHeight - obSize) : (grassTop - obSize),
    w: obSize,
    h: obSize,
    soort,
    inGras,
    actief: true
  });
}

// -----------------------------
// Player update
// -----------------------------
function updatePlayer() {
  photeinos.vy += 0.9; // zwaartekracht
  photeinos.y += photeinos.vy;

  if (photeinos.y + photeinos.h > canvas.height) {
    photeinos.y = canvas.height - photeinos.h;
    photeinos.vy = 0;
    photeinos.jumping = false;
  }
}

// -----------------------------
// Collision
// -----------------------------
function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function collisionCheck(ob) {
  return rectsOverlap(photeinos, ob);
}

// -----------------------------
// Update loop
// -----------------------------
function update() {
  if (!running || paused) return;

  updatePlayer();

  const speed = 1 + (level - 1) * 0.5; // iets sneller per level
  obstacles.forEach(o => o.x -= speed);
  obstacles = obstacles.filter(o => o.x + o.w > 0 && o.actief);

  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (o.actief && collisionCheck(o)) {
      paused = true;
      toonVraag(o);
      o.actief = false;
    }
  }

  // achtergrond laten bewegen
  flowers.forEach(f => {
    f.x -= 0.3;
    if (f.x < -20) f.x = canvas.width + 20;
  });
  clouds.forEach(c => {
    c.x -= 0.2;
    if (c.x < -40) c.x = canvas.width + 30;
  });
}

// -----------------------------
// Draw loop
// -----------------------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // lucht
  ctx.fillStyle = "#aee7ff";
  ctx.fillRect(0, 0, canvas.width, zoneHeight);

  // gras
  ctx.fillStyle = "#8BC34A";
  ctx.fillRect(0, grassTop, canvas.width, zoneHeight);

  // wolken
  ctx.font = "28px Arial";
  clouds.forEach(c => ctx.fillText(c.glyph, c.x, c.y));

  // bloemen
  ctx.font = "22px Arial";
  flowers.forEach(f => ctx.fillText(f.glyph, f.x, f.y));

  // obstakels
  ctx.font = `${obSize}px Arial`;
  obstacles.forEach(o => ctx.fillText(OBSTACLES[o.soort], o.x, o.y + o.h));

  // speler
  ctx.drawImage(photeinosImg, photeinos.x, photeinos.y, photeinos.w, photeinos.h);

  // score + level
  ctx.fillStyle = "black";
  ctx.font = "18px Comic Sans MS";
  ctx.fillText("Score: " + score + " | Level: " + level, 20, 25);
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
  score = 0;
  vleugels = 0;
  level = 1;
  obstacles = [];
  photeinos.vy = 0;
  photeinos.jumping = false;
  photeinos.y = canvas.height - photeinos.h;
};

document.getElementById("pauseBtn").onclick = () => { paused = !paused; };

// -----------------------------
// Spawners
// -----------------------------
setInterval(() => { if(running && !paused) spawnObstacle(); }, 6000);

// -----------------------------
// Vraag overlay
// -----------------------------
function toonVraag(ob) {
  const overlay = document.getElementById("vraagOverlay");
  const tekst = document.getElementById("vraagTekst");
  const antwoorden = document.getElementById("vraagAntwoorden");

  let q;
  if (ob.soort === "licht") {
    const vragenLicht = vragen.filter(v => v.type === "licht");
    q = vragenLicht[Math.floor(Math.random()*vragenLicht.length)];
  } else {
    const vragenZonde = vragen.filter(v => v.type === "zonde");
    q = vragenZonde[Math.floor(Math.random()*vragenZonde.length)];
  }

  tekst.textContent = q.q;
  antwoorden.innerHTML = "";

  q.a.forEach((optie, i) => {
    const btn = document.createElement("button");
    btn.innerText = optie;
    btn.onclick = () => {
      if (i === q.correct) {
        if (ob.soort === "licht") {
          score++;
          vleugels++;
          if (vleugels >= 10) {
            vleugels = 0;
            level++;
            alert("Proficiat! Level " + level);
          } else {
            alert("Goed zo!");
          }
        } else {
          alert("Goed zo!");
        }
      } else {
        if (ob.soort === "zonde") {
          alert("Fout bij zondevraag – Game Over!");
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
