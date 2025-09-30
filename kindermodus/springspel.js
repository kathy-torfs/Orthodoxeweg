// =============================
// springspel.js (met vragen en duidelijke notities)
// =============================

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Dynamische grootte
canvas.width = 800;
canvas.height = 500;

// -----------------------------
// Zones
// -----------------------------
const zoneHeight = canvas.height / 2; // 50% lucht, 50% gras
const grassTop = canvas.height - zoneHeight;

// -----------------------------
// Afmetingen
// -----------------------------
//nota// grootte van Photeinos = 35% van hoogte
const phSize = canvas.height * 0.35;
//nota// grootte van obstakels = 20% van hoogte
const obSize = canvas.height * 0.20;

// -----------------------------
// Assets
// -----------------------------
const photeinosImg = new Image();
photeinosImg.src = "https://kathy-torfs.github.io/Orthodoxeweg/images/photeinos_walk.png";

const OBSTACLES = {
  licht: "🪽",
  zonde: "💀"
};

// -----------------------------
// Voorbeeldvragen
// -----------------------------
const vragen = [
  { q: "Wie is de Zoon van God?", a: ["Mozes", "Jezus", "Paulus"], correct: 1, difficulty: "licht" },
  { q: "Wat doen we als we zondigen?", a: ["Bidden om vergeving", "Niets", "Meer zondigen"], correct: 0, difficulty: "zonde" },
  { q: "Waar gaan christenen op zondag naartoe?", a: ["Moskee", "Kerk", "Synagoge"], correct: 1, difficulty: "licht" }
];

// -----------------------------
// Speler
// -----------------------------
const photeinos = {
  x: 100,
  //nota// Startpositie van Photeinos bij laden
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
let level = 1;
let running = false;
let paused = false;

// -----------------------------
// Input
// -----------------------------
document.addEventListener("keydown", e => {
  if (e.key === " ") jump();
});
canvas.addEventListener("touchstart", () => jump());

// -----------------------------
// Jump
// -----------------------------
//nota// Spronghoogte: hoe negatief de vy = hoe hoger
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
  const soort = Math.random() < 0.6 ? "licht" : "zonde";
  const inGras = Math.random() < 0.5;

  obstacles.push({
    x: canvas.width,
    y: inGras ? (canvas.height - obSize) : (grassTop - obSize),
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

  // op de grond landen
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

  obstacles.forEach(o => o.x -= 2); // langzamer bewegen
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    if (o.actief && collisionCheck(o)) {
      paused = true;
      toonVraag(o);
      o.actief = false;
    }
  }
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

  // obstakels
  ctx.font = `${obSize}px Arial`;
  obstacles.forEach(o => {
    ctx.fillText(OBSTACLES[o.soort], o.x, o.y + o.h);
  });

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
// Controls: start/pauze
// -----------------------------
document.getElementById("startBtn").onclick = () => {
  running = true;
  score = 0;
  level = 1;
  obstacles = [];
  photeinos.vy = 0;
  photeinos.jumping = false;
  //nota// Startpositie van Photeinos bij spelstart
  photeinos.y = canvas.height - photeinos.h;
};

document.getElementById("pauseBtn").onclick = () => { paused = !paused; };

// -----------------------------
// Spawners
// -----------------------------
// max 2 obstakels tegelijk
setInterval(() => { 
  if(running && !paused && obstacles.length < 2) spawnObstacle(); 
}, 5000);

// -----------------------------
// Vraag overlay
// -----------------------------
function toonVraag(ob) {
  const overlay = document.getElementById("vraagOverlay");
  const tekst = document.getElementById("vraagTekst");
  const antwoorden = document.getElementById("vraagAntwoorden");

  let q;
  if (ob.soort === "licht") {
    q = vragen.find(v => v.difficulty === "licht");
  } else {
    q = vragen.find(v => v.difficulty === "zonde");
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
          if (score % 10 === 0) level++;
        }
        alert("Goed zo!");
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
