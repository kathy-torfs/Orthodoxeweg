// =============================
// springspel.js (schone versie met jouw vragen)
// =============================

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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
//nota// grootte Photeinos
const phSize = canvas.height * 0.30; 
//nota// grootte Obstakels
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
// Speler
// -----------------------------
const photeinos = {
  x: 100,
  //nota// Startpositie (bij laden én bij start spel)
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
document.addEventListener("keydown", e => { if (e.key === " ") jump(); });
canvas.addEventListener("touchstart", () => jump());

// -----------------------------
// Jump
// -----------------------------
//nota// Spronghoogte hier aanpassen
function jump() {
  if (!photeinos.jumping) {
    photeinos.vy = -22; // sterkere sprong → hoog genoeg in luchtzone
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
    //nota// plaats obstakel gecentreerd in zijn zone
    y: inGras 
      ? (grassTop + (zoneHeight / 2) - (obSize / 2)) // midden gras
      : ((zoneHeight / 2) - (obSize / 2)),          // midden lucht
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
  photeinos.vy += 1.0; // zwaartekracht
  photeinos.y += photeinos.vy;

  // begrenzen op gras
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

  obstacles.forEach(o => o.x -= 2); 
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    if (o.actief && collisionCheck(o)) {
      paused = true;
      toonVraag(o); //nota// gebruikt jouw vragen.js
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
// Controls
// -----------------------------
document.getElementById("startBtn").onclick = () => {
  running = true;
  score = 0;
  level = 1;
  obstacles = [];
  photeinos.vy = 0;
  photeinos.jumping = false;
  photeinos.y = canvas.height - photeinos.h; // startpositie resetten
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
// Vragen (van jouw vragen.js)
// -----------------------------
//nota// gebruikt gewoon jouw vragenbestand
function toonVraag(ob) {
  // Jouw vragen.js voorziet vragen[] en logica
  const overlay = document.getElementById("vraagOverlay");
  const tekst = document.getElementById("vraagTekst");
  const antwoorden = document.getElementById("vraagAntwoorden");

  // filter vragen volgens obstakel
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
        if (ob.soort === "licht") score++;
        if (score % 10 === 0) level++;
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
