// =============================
// springspel.js
// =============================

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Dynamische grootte → ook speelbaar op tablet/gsm
canvas.width = window.innerWidth > 900 ? 900 : window.innerWidth - 20;
canvas.height = 500;

// -----------------------------
// Zones
// -----------------------------
// nota: graszone = onderste helft, luchtzone = bovenste helft
let grassHeight = canvas.height / 2;  
let grassTop = canvas.height - grassHeight;

// -----------------------------
// Speler (Photeinos)
// -----------------------------
// nota: grootte = 1/5 van canvas hoogte, startpositie netjes in graszone
const photeinos = {
  x: 100,
  w: canvas.height / 5,
  h: canvas.height / 5,
  vy: 0,
  jumping: false,
  y: 0
};
photeinos.y = grassTop - photeinos.h; // ✅ onderkant gelijk met gras

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
// Variabelen spel
// -----------------------------
let obstacles = [];
let score = 0;
let running = false;
let paused = false;
let keys = {};

// -----------------------------
// Achtergrond-elementen
// -----------------------------
let clouds = [];
let flowers = [];

function makeClouds(count = 6) {
  clouds = [];
  for (let i = 0; i < count; i++) {
    clouds.push({
      x: Math.random() * canvas.width,
      y: 30 + Math.random() * 80
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
canvas.addEventListener("touchstart", () => jump()); // tablet/gsm

// -----------------------------
// Jump
// -----------------------------
function jump() {
  if (!photeinos.jumping) {
    photeinos.vy = -16;   // springkracht
    photeinos.jumping = true;
  }
}

// -----------------------------
// Obstakels
// -----------------------------
// nota: ofwel in graszone, ofwel in luchtzone
function spawnObstacle() {
  const soort = Math.random() < 0.7 ? "licht" : "zonde";
  const inGras = Math.random() < 0.5;

  obstacles.push({
    x: canvas.width,
    w: canvas.width / 15,
    h: canvas.width / 15,
    soort: soort,
    inGras: inGras,
    y: inGras ? grassTop - canvas.width/15 : grassTop - grassHeight/2
  });
}

// -----------------------------
// Update speler
// -----------------------------
function updatePlayer() {
  if (keys[" "]) jump();

  photeinos.vy += 0.9; // zwaartekracht
  photeinos.y += photeinos.vy;

  // landen op gras
  if (photeinos.y + photeinos.h > grassTop) {
    photeinos.y = grassTop - photeinos.h;
    photeinos.vy = 0;
    photeinos.jumping = false;
  }
}

// -----------------------------
// Collision check
// -----------------------------
// nota: gras → raak als je NIET springt
//       lucht → raak als je WEL springt
function collisionCheck(ob) {
  const xHit = photeinos.x < ob.x + ob.w && photeinos.x + photeinos.w > ob.x;
  if (!xHit) return false;

  return ob.inGras ? !photeinos.jumping : photeinos.jumping;
}

// -----------------------------
// Update loop
// -----------------------------
function update() {
  if (!running || paused) return;

  updatePlayer();

  // obstakels bewegen
  obstacles.forEach(o => o.x -= 2);
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  // botsing?
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    if (collisionCheck(o)) {
      paused = true;
      let q;
      if (o.soort === "licht") {
        const vragenLicht = vragen.filter(v => typeof v.difficulty === "number");
        q = vragenLicht[Math.floor(Math.random()*vragenLicht.length)];
      } else {
        const vragenZonde = vragen.filter(v => v.difficulty === "zonde");
        q = vragenZonde[Math.floor(Math.random()*vragenZonde.length)];
      }
      toonVraag(q, o.soort);
      obstacles.splice(i, 1); // ❌ obstakel meteen weghalen
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
  ctx.font = "40px Arial";
  obstacles.forEach(o => ctx.fillText(OBSTACLES[o.soort], o.x, o.y));

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
// Controls: start/pauze
// -----------------------------
const startBtn = document.createElement("button");
startBtn.innerText = "▶ Start spel (-20 punten)";
Object.assign(startBtn.style, {
  position: "absolute", bottom: "30px", right: "180px",
  padding: "15px 25px", fontSize: "20px",
  background: "#7bb235", color: "white",
  border: "none", borderRadius: "12px", cursor: "pointer"
});
document.body.appendChild(startBtn);

startBtn.onclick = () => {
  running = true;
  score = 0;
  obstacles = [];
  photeinos.y = grassTop - photeinos.h; // reset
  photeinos.vy = 0;
  photeinos.jumping = false;
};

const pauseBtn = document.createElement("button");
pauseBtn.innerText = "⏸ Pauze";
Object.assign(pauseBtn.style, {
  position: "absolute", bottom: "30px", right: "30px",
  padding: "15px 25px", fontSize: "20px",
  background: "#67510C", color: "white",
  border: "none", borderRadius: "12px", cursor: "pointer"
});
document.body.appendChild(pauseBtn);

pauseBtn.onclick = () => { paused = !paused; };

// -----------------------------
// Spawners
// -----------------------------
setInterval(() => { if(running && !paused) spawnObstacle(); }, 4000);

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
          alert("Dat is fout!");
        }
      }
      overlay.style.display = "none";
      paused = false;
    };
    antwoorden.appendChild(btn);
  });

  overlay.style.display = "flex";
}
