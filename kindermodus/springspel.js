// =============================
// springspel.js
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
let grassHeight = canvas.height / 4;
let grassTop = canvas.height - grassHeight;

const photeinos = { 
  x: 100, 
  y: canvas.height - 50 - 10,  // netjes in graszone
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
let vleugels = 0;
let running = false;
let paused = false;
let showVraag = false;
let huidigeVraag = null;
let vraagType = null;

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
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Touch controls (tablet)
canvas.addEventListener("touchstart", () => jump());

// -----------------------------
// Speed per level
// -----------------------------
function speedForLevel(level) {
  const base = 1.2;      // trager basis
  const perLevel = 0.3;  // stijgt rustig
  return base + level * perLevel;
}

// -----------------------------
// Obstakels
// -----------------------------
function spawnObstacle() {
  const soort = Math.random() < 0.7 ? "licht" : "zonde";
  const inGras = Math.random() < 0.5;

  obstacles.push({
    x: canvas.width,
    y: inGras ? grassTop - 20 : grassTop - 120,
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

  photeinos.vy += 0.8; // zwaartekracht
  photeinos.y += photeinos.vy;

  // op gras landen
  if (photeinos.y + photeinos.h > grassTop) {
    photeinos.y = grassTop - photeinos.h;
    photeinos.vy = 0;
    photeinos.jumping = false;
  }
}

// -----------------------------
// Collision check
// -----------------------------
function collisionCheck(ob) {
  const xHit = photeinos.x < ob.x + ob.w && photeinos.x + photeinos.w > ob.x;
  if (!xHit) return false;

  if (ob.inGras) {
    return !photeinos.jumping; // geraakt als je niet springt
  } else {
    return photeinos.jumping;  // geraakt als je wel springt
  }
}

// -----------------------------
// Vraag selectie
// -----------------------------
const lichtVragen = {
  1: vragen.filter(v => v.difficulty === 1),
  2: vragen.filter(v => v.difficulty === 2),
  3: vragen.filter(v => v.difficulty === 3),
  4: vragen.filter(v => v.difficulty === 3),
  5: vragen.filter(v => v.difficulty === 3)
};
const zondeVragen = vragen.filter(v => v.difficulty === "zonde");

function toonVraag(type) {
  paused = true;
  showVraag = true;
  vraagType = type;
  if (type === "licht") {
    const lijst = lichtVragen[currentLevel+1] || lichtVragen[1];
    huidigeVraag = lijst[Math.floor(Math.random()*lijst.length)];
  } else {
    huidigeVraag = zondeVragen[Math.floor(Math.random()*zondeVragen.length)];
  }
  renderVraag();
}

function antwoordGegeven(index) {
  if (!huidigeVraag) return;
  if (vraagType === "licht") {
    if (index === huidigeVraag.correct) {
      score++;
      vleugels++;
      if (vleugels >= 10) {
        currentLevel++;
        vleugels = 0;
        alert("Level " + (currentLevel+1) + " bereikt!");
      }
    }
  } else if (vraagType === "zonde") {
    if (index !== huidigeVraag.correct) {
      running = false;
      alert("Fout! Game Over.");
    }
  }
  showVraag = false;
  paused = false;
  huidigeVraag = null;
}

// -----------------------------
// Vraag UI
// -----------------------------
function renderVraag() {
  if (!showVraag || !huidigeVraag) return;

  const modal = document.getElementById("vraagModal");
  const vraagTekst = document.getElementById("vraagTekst");
  const antwoordenDiv = document.getElementById("antwoorden");

  vraagTekst.innerText = huidigeVraag.q;
  antwoordenDiv.innerHTML = "";

  huidigeVraag.a.forEach((ans, i) => {
    const btn = document.createElement("button");
    btn.innerText = ans;
    btn.onclick = () => antwoordGegeven(i);
    antwoordenDiv.appendChild(btn);
  });

  modal.style.display = "block";
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
      toonVraag(o.soort);
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
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // wolken
  ctx.font = "24px Arial";
  clouds.forEach(c => {
    ctx.fillText("☁️", c.x, c.y);
    c.x -= 0.2;
    if (c.x < -30) c.x = canvas.width + 20;
  });

  // gras
  ctx.fillStyle = "#8BC34A";
  ctx.fillRect(0, grassTop, canvas.width, grassHeight);

  // bloemen
  ctx.font = "20px Arial";
  flowers.forEach(f => {
    ctx.fillText(f.glyph, f.x, f.y);
    f.x -= 0.5;
    if (f.x < -20) f.x = canvas.width + 20;
  });

  // obstakels
  ctx.font = "30px Arial";
  obstacles.forEach(o => ctx.fillText(OBSTACLES[o.soort], o.x, o.y));

  // speler
  ctx.drawImage(photeinosImg, photeinos.x, photeinos.y, photeinos.w, photeinos.h);

  // score
  ctx.fillStyle = "black";
  ctx.font = "18px Comic Sans MS";
  ctx.fillText("Score: " + score + " | Vleugels: " + vleugels, 20, 25);
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
  vleugels = 0;
  currentLevel = 0;
  obstacles = [];
  photeinos.y = canvas.height - photeinos.h - 10; // startpositie vast
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
