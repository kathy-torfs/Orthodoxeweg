// ======================
// SPRINGSPEL.JS – BASIS
// ======================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Schermgrootte
canvas.width = 800;
canvas.height = 500;

// Zones
const zoneHeight = canvas.height / 2;
const grassTop = canvas.height - zoneHeight;

// Afmetingen
const phSize = canvas.height * 0.32;
const obSize = canvas.height * 0.17;
const obstacleSpeed = 1.1;

// Assets
const photeinosImg = new Image();
photeinosImg.src = "https://kathy-torfs.github.io/Orthodoxeweg/images/photeinos_walk.png";

const OBSTACLES = {
  licht: "🪽",
  zonde: "💀"
};

// Speler
const photeinos = {
  x: 90,
  y: canvas.height - phSize,
  w: phSize,
  h: phSize,
  vy: 0,
  jumping: false
};

// Game vars
let obstacles = [];
let vleugels = 0;
let level = 1;
let running = false;
let paused = false;

// Bloemen & wolkjes
let flowers = [], clouds = [];
function makeFlowers(count = 12) {
  flowers = [];
  for (let i = 0; i < count; i++) {
    flowers.push({
      x: Math.random() * canvas.width,
      y: grassTop + Math.random() * (zoneHeight - 22),
      glyph: ["🌷","🌻","🌼","🌸","🌹","🌺","🌿","🍀"][Math.floor(Math.random()*8)]
    });
  }
}
function makeClouds(count = 8) {
  clouds = [];
  for (let i = 0; i < count; i++) {
    clouds.push({
      x: Math.random() * canvas.width,
      y: 22 + Math.random() * (zoneHeight-45),
      size: 25 + Math.random()*20
    });
  }
}
makeFlowers();
makeClouds();

// Input
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);
canvas.addEventListener("touchstart", () => jump());
let keys = {};

// Jump
function jump() {
  if (!photeinos.jumping) {
    photeinos.vy = -20.5; // HOOGTE
    photeinos.jumping = true;
  }
}

// Obstakels
function spawnObstacle() {
  if (obstacles.length >= 2) return;
  const soort = Math.random() < 0.6 ? "licht" : "zonde";
  const lucht = ! (soort === "zonde");
  obstacles.push({
    x: canvas.width,
    y: lucht
      ? grassTop - obSize + 10         // lucht (boven gras)
      : canvas.height - obSize,         // gras
    w: obSize,
    h: obSize,
    soort,
    lucht,
    actief: true
  });
}

// Player update
function updatePlayer() {
  if (keys[" "]) jump();

  photeinos.vy += 1.05;
  photeinos.y += photeinos.vy;

  if (photeinos.y + photeinos.h > canvas.height) {
    photeinos.y = canvas.height - photeinos.h;
    photeinos.vy = 0;
    photeinos.jumping = false;
  }
  if (photeinos.y < 0) {
    photeinos.y = 0;
    photeinos.vy = 0;
  }
}

// Collision (precies contactvlak)
function rectsOverlap(a, b) {
  return (
    a.x + a.w > b.x + 10 &&
    a.x < b.x + b.w - 10 &&
    a.y + a.h > b.y + 10 &&
    a.y < b.y + b.h - 10
  );
}

function collisionCheck(ob) {
  if (!rectsOverlap(photeinos, ob)) return false;
  if (ob.lucht) {
    return photeinos.jumping;
  } else {
    return !photeinos.jumping && photeinos.y + photeinos.h >= grassTop;
  }
}

// Update loop
function update() {
  if (!running || paused) return;

  updatePlayer();

  obstacles.forEach(o => o.x -= obstacleSpeed);

  // Obstakels blijven tot je ze écht raakt of ze uit beeld zijn
  obstacles = obstacles.filter(o => o.x + o.w > 0 && o.actief);

  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (o.actief && collisionCheck(o)) {
      paused = true;
      toonVraag(o);
      o.actief = false;
    }
  }
}

// Draw loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#aee7ff";
  ctx.fillRect(0, 0, canvas.width, zoneHeight);

  // wolkjes
  ctx.font = "28px Arial";
  clouds.forEach(c => {
    ctx.globalAlpha = 0.9;
    ctx.fillText("☁️", c.x, c.y);
    c.x -= 0.15;
    if (c.x < -35) c.x = canvas.width + 40;
  });
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#8BC34A";
  ctx.fillRect(0, grassTop, canvas.width, zoneHeight);

  // bloemen
  ctx.font = "22px Arial";
  flowers.forEach(f => {
    ctx.fillText(f.glyph, f.x, f.y);
    f.x -= 0.22;
    if (f.x < -15) f.x = canvas.width + 15;
  });

  // obstakels
  ctx.font = `${obSize}px Arial`;
  obstacles.forEach(o => {
    ctx.fillText(OBSTACLES[o.soort], o.x, o.y + o.h - 8);
  });

  // speler
  ctx.drawImage(photeinosImg, photeinos.x, photeinos.y, photeinos.w, photeinos.h);

  // score/level
  ctx.fillStyle = "#0a275b";
  ctx.font = "22px Comic Sans MS";
  ctx.fillText("Level: " + level + " | Vleugels: " + vleugels, 20, 38);
}

// Main loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();

// Controls
document.getElementById("startBtn").onclick = () => {
  running = true;
  vleugels = 0;
  level = 1;
  obstacles = [];
  photeinos.vy = 0;
  photeinos.jumping = false;
  photeinos.y = canvas.height - photeinos.h;
  makeFlowers();
  makeClouds();
};
document.getElementById("pauseBtn").onclick = () => {
  paused = !paused;
};

// Spawners (relax interval)
setInterval(() => { if(running && !paused) spawnObstacle(); }, 5100);

// Vraag overlay
function toonVraag(ob) {
  const overlay = document.getElementById("vraagOverlay");
  const tekst = document.getElementById("vraagTekst");
  const antwoorden = document.getElementById("vraagAntwoorden");

  let q;
  if (ob.soort === "licht") {
    let vragenLicht = vragen.filter(v => v.difficulty == level);
    if (vragenLicht.length === 0) {
      let maxLvl = Math.max(...vragen.filter(v => typeof v.difficulty === "number").map(v => v.difficulty));
      vragenLicht = vragen.filter(v => v.difficulty == maxLvl);
    }
    q = vragenLicht[Math.floor(Math.random() * vragenLicht.length)];
  } else {
    const vragenZonde = vragen.filter(v => v.difficulty === "zonde");
    q = vragenZonde[Math.floor(Math.random() * vragenZonde.length)];
  }

  tekst.textContent = q.q;
  antwoorden.innerHTML = "";

  let opties = [...q.a];
  if (level === 3) opties = opties.slice(0, 2);
  if (level === 4) opties = opties.slice(0, 3);

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
            // (Hier mag eventueel een animatie komen)
          }
        }
        // Geen alert
      } else {
        if (ob.soort === "zonde") {
          running = false;
        }
        // Geen alert
      }
      overlay.style.display = "none";
      paused = false;
    };
    antwoorden.appendChild(btn);
  });

  overlay.style.display = "flex";
}
