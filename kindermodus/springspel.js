// =============================
// springspel.js (volledige versie)
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
//nota// graszone = onderste 1/4 van het canvas
let grassHeight = canvas.height / 4;
let grassTop = canvas.height - grassHeight;

//nota// Photeinos voeten net boven canvasbodem
const photeinos = { 
  x: 100, 
  y: canvas.height - 60 - 5,  // volledig in graszone
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
// Achtergrond
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

function makeFlowers(count = 20) {
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
document.addEventListener("keydown", e => {
  if (e.key === " ") { e.preventDefault(); jump(); }
});
canvas.addEventListener("touchstart", () => jump());

// -----------------------------
// Speed
// -----------------------------
function speedForLevel(level) {
  const base = 1.0;
  const perLevel = 0.3;
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
    y: inGras ? grassTop - 20 : grassTop - 100,
    w: 40, h: 40,
    soort: soort,
    inGras: inGras,
    actief: true
  });
}

// -----------------------------
// Jump
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
  photeinos.vy += 0.8;
  photeinos.y += photeinos.vy;

  //nota// Landen op gras
  const ground = canvas.height - 5; 
  if (photeinos.y + photeinos.h > ground) {
    photeinos.y = ground - photeinos.h;
    photeinos.vy = 0;
    photeinos.jumping = false;
  }
}

// -----------------------------
// Collision
// -----------------------------
function collisionCheck(ob) {
  const xHit = photeinos.x < ob.x + ob.w && photeinos.x + photeinos.w > ob.x;
  if (!xHit) return false;
  if (ob.inGras) return !photeinos.jumping;
  else return photeinos.jumping;
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
      paused = true; // pauzeer spel
      let q;
      if (o.soort === "licht") {
        const vragenLicht = vragen.filter(v => typeof v.difficulty === "number");
        q = vragenLicht[Math.floor(Math.random()*vragenLicht.length)];
      } else {
        const vragenZonde = vragen.filter(v => v.difficulty === "zonde");
        q = vragenZonde[Math.floor(Math.random()*vragenZonde.length)];
      }
      toonVraag(q, o.soort);
      o.actief = false;
    }
  }
}

// -----------------------------
// Draw
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
  ctx.fillText("Score: " + score, 20, 25);
}

// -----------------------------
// Loop
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
document.body.appendChild(startBtn);

startBtn.onclick = () => {
  running = true;
  score = 0;
  currentLevel = 0;
  obstacles = [];
  photeinos.vy = 0;
  photeinos.jumping = false;
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
        if (soort === "licht") score++;
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
