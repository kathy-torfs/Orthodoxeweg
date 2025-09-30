// =============================
// springspel.js – Orthodoxe Kinderpagina
// =============================

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

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
// Gras & speler
// -----------------------------
let grassHeight = canvas.height / 3;
let grassTop = canvas.height - grassHeight;

//nota// photeinos wordt altijd geplaatst net boven het gras
const photeinos = { 
  x: 100, 
  y: grassTop - 20,   // altijd correct in graszone
  w: 60, 
  h: 60, 
  vy: 0, 
  jumping: false 
};

// -----------------------------
// Game variabelen
// -----------------------------
let currentLevel = 0;
let obstacles = [];
let keys = {};
let score = 0;
let running = false;
let paused = false;

// -----------------------------
// Achtergrond state
// -----------------------------
let clouds = [];
let flowers = [];

function makeClouds(count = 6) {
  clouds = [];
  for (let i = 0; i < count; i++) {
    clouds.push({
      x: Math.random() * canvas.width,
      y: 30 + Math.random() * 80,
      size: 20 + Math.random() * 20
    });
  }
}
function makeFlowers(count = 15) {
  flowers = [];
  for (let i = 0; i < count; i++) {
    const rowOffset = [20, 40, 60][Math.floor(Math.random()*3)];
    flowers.push({
      x: Math.random() * canvas.width,
      y: grassTop + rowOffset,
      glyph: FLOWERS[Math.floor(Math.random()*FLOWERS.length)]
    });
  }
}
makeClouds();
makeFlowers();

// -----------------------------
// Input
// -----------------------------
//nota// springen met spatiebalk of tik op canvas
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);
canvas.addEventListener("touchstart", () => jump());

// -----------------------------
// Speed per level
// -----------------------------
//nota// lage basissnelheid en zachte stijging
function speedForLevel(level) {
  const base = 1.0;
  const perLevel = 0.3;
  return base + level * perLevel;
}

// -----------------------------
// Obstakels
// -----------------------------
//nota// obstakels komen in 2 banden: gras of lucht
function spawnObstacle() {
  const soort = Math.random() < 0.7 ? "licht" : "zonde";
  const inGras = Math.random() < 0.5;

  obstacles.push({
    x: canvas.width,
    y: inGras ? (grassTop - 40) : (grassTop - 160),
    w: 40, h: 40,
    soort: soort,
    inGras: inGras,
    actief: true
  });
}

// -----------------------------
// Jump functie
// -----------------------------
function jump() {
  if (!photeinos.jumping) {
    photeinos.vy = -14;
    photeinos.jumping = true;
  }
}

// -----------------------------
// Player update
// -----------------------------
function updatePlayer() {
  if (keys[" "]) jump();

  photeinos.vy += 0.8; 
  photeinos.y += photeinos.vy;

  //nota// landen op gras
  if (photeinos.y + photeinos.h > grassTop) {
    photeinos.y = grassTop - photeinos.h;
    photeinos.vy = 0;
    photeinos.jumping = false;
  }
}

// -----------------------------
// Collision check
// -----------------------------
//nota// gras = raak bij niet springen, lucht = raak bij springen
function collisionCheck(ob) {
  const xHit = photeinos.x < ob.x + ob.w && photeinos.x + photeinos.w > ob.x;
  if (!xHit) return false;

  if (ob.inGras) {
    return !photeinos.jumping;
  } else {
    return photeinos.jumping;
  }
}

// -----------------------------
// Update loop
// -----------------------------
function update() {
  if (!running || paused) return;

  updatePlayer();
  const spd = speedForLevel(currentLevel);

  obstacles.forEach(o => o.x -= spd);
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    if (o.actief && collisionCheck(o)) {
      paused = true; // spel pauzeren
      toonVraag(kiesVraag(o.soort), o.soort);
      o.actief = false; //nota// obstakel verdwijnt na vraag
    }
  }
}

// -----------------------------
// Draw loop
// -----------------------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#aee7ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "24px Arial";
  clouds.forEach(c => {
    ctx.fillText("☁️", c.x, c.y);
    c.x -= 0.2;
    if (c.x < -30) c.x = canvas.width + 20;
  });

  ctx.fillStyle = "#8BC34A";
  ctx.fillRect(0, grassTop, canvas.width, grassHeight);

  ctx.font = "20px Arial";
  flowers.forEach(f => {
    ctx.fillText(f.glyph, f.x, f.y);
    f.x -= 0.5;
    if (f.x < -20) f.x = canvas.width + 20;
  });

  ctx.font = "30px Arial";
  obstacles.forEach(o => ctx.fillText(OBSTACLES[o.soort], o.x, o.y));

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
// Controls: start/pauze
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
  currentLevel = 0;
  obstacles = [];
  photeinos.vy = 0;
  photeinos.jumping = false;
  photeinos.y = grassTop - photeinos.h; //nota// juiste startpositie
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
setInterval(() => { if(running && !paused) spawnObstacle(); }, 5000);

// -----------------------------
// Vraag selectie + overlay
// -----------------------------
function kiesVraag(soort) {
  if (soort === "licht") {
    const vragenLicht = vragen.filter(v => typeof v.difficulty === "number");
    return vragenLicht[Math.floor(Math.random()*vragenLicht.length)];
  } else {
    const vragenZonde = vragen.filter(v => v.difficulty === "zonde");
    return vragenZonde[Math.floor(Math.random()*vragenZonde.length)];
  }
}

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
        if (soort === "licht") score++;
        alert("Goed zo!");
      } else {
        if (soort === "zonde") {
          alert("Dat is fout (zondevraag) – Game Over!");
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
