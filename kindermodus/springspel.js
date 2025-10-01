// =============================
// springspel.js (volledige versie met //nota//)
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
const zoneHeight = canvas.height / 2; // 50% lucht + 50% gras
const grassTop = canvas.height - zoneHeight; // bovenkant graszone

// -----------------------------
// Afmetingen
// -----------------------------
//nota// grootte van Photeinos aanpassen
const phSize = canvas.height * 0.35; // 35% van schermhoogte
//nota// grootte van obstakels aanpassen
const obSize = canvas.height * 0.20; // 20% van schermhoogte

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
  //nota// startpositie van Photeinos in graszone
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
let keys = {};
let vleugels = 0;  // telt vleugeltjes
let level = 1;     // startlevel
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
    //nota// springhoogte aanpassen
    photeinos.vy = -20;
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
// Collision (echte overlap)
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
  if (!rectsOverlap(photeinos, ob)) return false; // enkel bij echte botsing
  if (ob.inGras) {
    return !photeinos.jumping; // geraakt als niet springt
  } else {
    return photeinos.jumping;  // geraakt als springt
  }
}

// -----------------------------
// Update loop
// -----------------------------
function update() {
  if (!running || paused) return;

  updatePlayer();

  //nota// snelheid van obstakels aanpassen (kleiner = trager)
  obstacles.forEach(o => o.x -= 2);
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
  obstacles.forEach(o => ctx.fillText(OBSTACLES[o.soort], o.x, o.y + o.h));

  // speler
  ctx.drawImage(photeinosImg, photeinos.x, photeinos.y, photeinos.w, photeinos.h);

  // score/level
  ctx.fillStyle = "black";
  ctx.font = "18px Comic Sans MS";
  ctx.fillText("Level: " + level + " | Vleugels: " + vleugels, 20, 25);
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
startBtn.innerText = "▶ Start spel";
startBtn.style.position = "absolute";
startBtn.style.bottom = "30px";
startBtn.style.right = "180px";
document.body.appendChild(startBtn);

startBtn.onclick = () => {
  running = true;
  vleugels = 0;
  level = 1;
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
// Spawners
// -----------------------------
setInterval(() => { if(running && !paused) spawnObstacle(); }, 5000);

// -----------------------------
// Vraag overlay
// -----------------------------
function toonVraag(ob) {
  const overlay = document.getElementById("vraagOverlay");
  const tekst = document.getElementById("vraagTekst");
  const antwoorden = document.getElementById("vraagAntwoorden");

  let q;
  if (ob.soort === "licht") {
    const vragenLicht = vragen.filter(v => v.difficulty === level);
    q = vragenLicht[Math.floor(Math.random()*vragenLicht.length)];
  } else {
    const vragenZonde = vragen.filter(v => v.difficulty === "zonde");
    q = vragenZonde[Math.floor(Math.random()*vragenZonde.length)];
  }

  tekst.textContent = q.q;
  antwoorden.innerHTML = "";

  // aantal antwoorden beperken volgens level
  let opties = q.a;
  if (level === 3) opties = opties.slice(0, 2);
  if (level === 4) opties = opties.slice(0, 3);
  // level 5 = alle opties

  opties.forEach((optie, i) => {
    const btn = document.createElement("button");
    btn.innerText = optie;
    btn.onclick = () => {
      if (i === q.correct) {
        if (ob.soort === "licht") {
          vleugels++;
          if (vleugels >= 10) {
            level++;
            vleugels = 0;
            alert("Proficiat! Je bent naar level " + level + " gegaan.");
          }
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
