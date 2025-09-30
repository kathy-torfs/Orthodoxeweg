// =============================
// springspel.js (volledig)
// =============================

// Canvas ophalen
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// //nota//: standaardgrootte, maar via CSS wordt dit schaalbaar voor tablet/gsm
canvas.width = 800;
canvas.height = 400;

// -----------------------------
// Zones definiëren
// -----------------------------
// //nota//: 2 even grote zones: lucht (boven) en gras (onder)
const zoneHeight = canvas.height / 2;
const luchtTop = 0;
const luchtBottom = zoneHeight;
const grasTop = zoneHeight;
const grasBottom = canvas.height;

// -----------------------------
// Speler (Photeinos)
// -----------------------------
// //nota//: Photeinos is de helft van het scherm hoog (200px) en staat in graszone
const photeinos = {
  x: 100,
  y: grasBottom - zoneHeight, // staat in graszone
  w: zoneHeight,
  h: zoneHeight,
  jumping: false
};

const photeinosImg = new Image();
photeinosImg.src = "https://kathy-torfs.github.io/Orthodoxeweg/images/photeinos_walk.png";

// -----------------------------
// Obstakels
// -----------------------------
const OBSTACLES = {
  licht: "🪽",
  zonde: "💀"
};

let obstacles = [];

// //nota//: Obstakelgrootte = 1/3 van schermhoogte
const obstacleSize = canvas.height / 3;

// Functie om obstakel te maken
function spawnObstacle() {
  const soort = Math.random() < 0.7 ? "licht" : "zonde";
  const inGras = Math.random() < 0.5; // 50/50 kans

  obstacles.push({
    x: canvas.width,
    y: inGras ? (grasBottom - obstacleSize) : (luchtBottom - obstacleSize),
    w: obstacleSize,
    h: obstacleSize,
    soort: soort,
    inGras: inGras,
    actief: true
  });
}

// -----------------------------
// Input controls
// -----------------------------
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Touch (tablet/gsm)
canvas.addEventListener("touchstart", () => jump());

// -----------------------------
// Springen
// -----------------------------
// //nota//: Springen = naar luchtzone, daarna automatisch terugvallen
function jump() {
  if (!photeinos.jumping) {
    photeinos.jumping = true;
    photeinos.y = luchtBottom - photeinos.h; // naar luchtzone
    setTimeout(() => {
      photeinos.jumping = false;
      photeinos.y = grasBottom - photeinos.h; // terug naar graszone
    }, 900); // duur van sprong
  }
}

// -----------------------------
// Collision check
// -----------------------------
// //nota//: botsingslogica volgens afspraken
function collisionCheck(ob) {
  const xHit = photeinos.x < ob.x + ob.w && photeinos.x + photeinos.w > ob.x;
  if (!xHit) return false;

  if (ob.inGras) {
    return !photeinos.jumping; // geraakt als je NIET springt
  } else {
    return photeinos.jumping;  // geraakt als je WEL springt
  }
}

// -----------------------------
// Game variabelen
// -----------------------------
let score = 0;
let running = false;
let paused = false;

// -----------------------------
// Update loop
// -----------------------------
function update() {
  if (!running || paused) return;

  // Obstakels bewegen
  obstacles.forEach(o => o.x -= 2); // snelheid lager gezet
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  // Botsing
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    if (o.actief && collisionCheck(o)) {
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
      o.actief = false; // verdwijnt
    }
  }
}

// -----------------------------
// Teken loop
// -----------------------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // luchtzone
  ctx.fillStyle = "#aee7ff";
  ctx.fillRect(0, luchtTop, canvas.width, zoneHeight);

  // graszone
  ctx.fillStyle = "#8BC34A";
  ctx.fillRect(0, grasTop, canvas.width, zoneHeight);

  // obstakels
  ctx.font = `${obstacleSize}px Arial`;
  obstacles.forEach(o => ctx.fillText(OBSTACLES[o.soort], o.x, o.y + o.h));

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
// Start/pauze knoppen
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
  photeinos.y = grasBottom - photeinos.h; // reset positie in graszone
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
    btn.style.margin = "5px";
    btn.style.padding = "10px 15px";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
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
