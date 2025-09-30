// =============================
// springspel.js (volledige versie)
// =============================

//nota// Canvas ophalen
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//nota// Canvas responsive instellen
canvas.width = 800;
canvas.height = 400;

// -----------------------------
// Afmetingen & zones
// -----------------------------
//nota// We verdelen het speelveld in 2 zones: gras en lucht
const ZONE_H = canvas.height / 2;   // 200px bij hoogte 400
const grassTop = canvas.height - ZONE_H; // 200px

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
// Speler (Photeinos)
// -----------------------------
//nota// Photeinos is de helft van 1 zone groot (100px hoog bij 200px zone)
const photeinos = { 
  x: 100, 
  w: ZONE_H / 2, 
  h: ZONE_H / 2, 
  y: canvas.height - (ZONE_H / 2), // voeten op grasbodem
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
// Achtergrond
// -----------------------------
let clouds = [];
let flowers = [];

function makeClouds(count = 6) {
  clouds = [];
  for (let i = 0; i < count; i++) {
    clouds.push({
      x: Math.random() * canvas.width,
      y: 20 + Math.random() * 80
    });
  }
}

function makeFlowers(count = 15) {
  flowers = [];
  for (let i = 0; i < count; i++) {
    flowers.push({
      x: Math.random() * canvas.width,
      y: grassTop + 20 + Math.random() * (ZONE_H - 30),
      glyph: FLOWERS[Math.floor(Math.random() * FLOWERS.length)]
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

//nota// Op tablet/telefoon → springen bij aanraken
canvas.addEventListener("touchstart", () => jump());

// -----------------------------
// Snelheid
// -----------------------------
function speedForLevel() {
  return 1.2; // rustige snelheid
}

// -----------------------------
// Obstakels
// -----------------------------
//nota// Obstakels zijn 1/4 van de zone (50px groot bij 200px zone)
function spawnObstacle() {
  const soort = Math.random() < 0.7 ? "licht" : "zonde";
  const inGras = Math.random() < 0.5; // 50% kans gras of lucht

  obstacles.push({
    x: canvas.width,
    y: inGras 
        ? canvas.height - 50   // obstakel in graszone
        : grassTop - 50,       // obstakel in luchtzone
    w: ZONE_H / 4,
    h: ZONE_H / 4,
    soort: soort,
    inGras: inGras,
    actief: true
  });
}

// -----------------------------
// Springen
// -----------------------------
function jump() {
  if (!photeinos.jumping) {
    photeinos.vy = -15; // springkracht
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

  // landen op gras
  const groundY = canvas.height - photeinos.h;
  if (photeinos.y > groundY) {
    photeinos.y = groundY;
    photeinos.vy = 0;
    photeinos.jumping = false;
  }
}

// -----------------------------
// Collision
// -----------------------------
function collisionCheck(ob) {
  const xHit = photeinos.x < ob.x + ob.w && photeinos.x + photeinos.w > ob.x;
  const yHit = photeinos.y < ob.y + ob.h && photeinos.y + photeinos.h > ob.y;
  return xHit && yHit;
}

// -----------------------------
// Update loop
// -----------------------------
function update() {
  if (!running || paused) return;

  updatePlayer();
  const spd = speedForLevel();

  obstacles.forEach(o => o.x -= spd);
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    if (o.actief && collisionCheck(o)) {
      paused = true;
      toonVraag(o.soort);
      o.actief = false; //nota// obstakel verdwijnt na contact
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
  ctx.fillRect(0, 0, canvas.width, grassTop);

  // gras
  ctx.fillStyle = "#8BC34A";
  ctx.fillRect(0, grassTop, canvas.width, ZONE_H);

  // bloemen
  ctx.font = "20px Arial";
  flowers.forEach(f => {
    ctx.fillText(f.glyph, f.x, f.y);
    f.x -= 0.5;
    if (f.x < -20) f.x = canvas.width + 20;
  });

  // obstakels
  ctx.font = "40px Arial";
  obstacles.forEach(o => {
    if (o.actief) ctx.fillText(OBSTACLES[o.soort], o.x, o.y);
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
// Controls: start/pauze
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
  obstacles = [];
  photeinos.vy = 0;
  photeinos.jumping = false;
  photeinos.y = canvas.height - photeinos.h; //nota// correcte startpositie
};

const pauseBtn = document.createElement("button");
pauseBtn.innerText = "⏸ Pauze";
pauseBtn.style.position = "absolute";
pauseBtn.style.bottom = "30px";
pauseBtn.style.right = "30px";
document.body.appendChild(pauseBtn);

pauseBtn.onclick = () => { paused = !paused; };

// -----------------------------
// Obstakel spawner
// -----------------------------
setInterval(() => { if(running && !paused) spawnObstacle(); }, 4000);

// -----------------------------
// Vraag overlay
// -----------------------------
function toonVraag(soort) {
  const overlay = document.getElementById("vraagOverlay");
  const tekst = document.getElementById("vraagTekst");
  const antwoorden = document.getElementById("vraagAntwoorden");

  //nota// simpele testvraag voor nu
  tekst.textContent = (soort === "licht") ? "Goed of fout?" : "Zondevraag!";
  antwoorden.innerHTML = "";

  ["Goed", "Fout"].forEach((optie, i) => {
    const btn = document.createElement("button");
    btn.innerText = optie;
    btn.onclick = () => {
      if (optie === "Goed") {
        score++;
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
