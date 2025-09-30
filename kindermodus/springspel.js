// =============================
// springspel.js (volledige nieuwe versie)
// =============================

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//nota// Schermgrootte vastzetten
canvas.width = 800;
canvas.height = 500;

// -----------------------------
// Zones
// -----------------------------
//nota// Halverwege canvas: onder = gras, boven = lucht
const zoneHeight = canvas.height / 2;
const grassTop = canvas.height - zoneHeight;

// -----------------------------
// Afmetingen
// -----------------------------
//nota// Grootte Photeinos = 35% vh scherm
const phSize = canvas.height * 0.35;
//nota// Grootte obstakels = 30% vh scherm
const obSize = canvas.height * 0.30;

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
  y: canvas.height - phSize, // start onderaan in graszone
  w: phSize,
  h: phSize,
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
// Input
// -----------------------------
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Touch controls
canvas.addEventListener("touchstart", () => jump());

// -----------------------------
// Jump
// -----------------------------
function jump() {
  if (!photeinos.jumping) {
    //nota// springhoogte zodat hij helemaal in luchtzone komt
    photeinos.vy = -18;
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
    y: inGras ? (canvas.height - obSize) : (zoneHeight - obSize),
    w: obSize,
    h: obSize,
    soort,
    actief: true
  });
}

// -----------------------------
// Player update
// -----------------------------
function updatePlayer() {
  if (keys[" "]) jump();

  photeinos.vy += 0.9; // zwaartekracht
  photeinos.y += photeinos.vy;

  // ondergrond begrenzen
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

// -----------------------------
// Update loop
// -----------------------------
function update() {
  if (!running || paused) return;

  updatePlayer();

  //nota// Obstakels trager laten bewegen
  obstacles.forEach(o => o.x -= 2);
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    if (o.actief && rectsOverlap(photeinos, o)) {
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

  // score
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
// Controls
// -----------------------------
const startBtn = document.createElement("button");
startBtn.innerText = "▶ Start spel (-20 punten)";
startBtn.style.position = "absolute";
startBtn.style.bottom = "30px";
startBtn.style.right = "180px";
startBtn.style.padding = "15px 25px";
startBtn.style.fontSize = "20px";
startBtn.style.background = "#7bb235";
startBtn.style.color = "white";
startBtn.style.border = "none";
startBtn.style.borderRadius = "12px";
startBtn.style.cursor = "pointer";
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
pauseBtn.style.padding = "15px 25px";
pauseBtn.style.fontSize = "20px";
pauseBtn.style.background = "#67510C";
pauseBtn.style.color = "white";
pauseBtn.style.border = "none";
pauseBtn.style.borderRadius = "12px";
pauseBtn.style.cursor = "pointer";
document.body.appendChild(pauseBtn);

pauseBtn.onclick = () => { paused = !paused; };

// -----------------------------
// Spawners
// -----------------------------
//nota// Obstakels minder snel: om de 6 seconden
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
    const vragenLicht = vragen.filter(v => typeof v.difficulty === "number");
    q = vragenLicht[Math.floor(Math.random()*vragenLicht.length)];
  } else {
    const vragenZonde = vragen.filter(v => v.difficulty === "zonde");
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
