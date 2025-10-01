// =============================
// springspel.js – vriendelijk en eerlijk! 🌱🌤️
// =============================

// Canvas & context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

// -----------------------------
// Zones & maten
// -----------------------------
const zoneHeight = canvas.height / 2;
const grassTop = canvas.height - zoneHeight;

const phSize = canvas.height * 0.37;
const obSize = canvas.height * 0.17;
const obstacleSpeed = 1.1;

// Obstakel Y-waardes: lucht of gras
const OBSTACLE_HEIGHTS = [
  canvas.height - obSize,              // gras (onder)
  grassTop - obSize + 7                // lucht (boven)
];

// -----------------------------
// Assets
// -----------------------------
const photeinosImg = new Image();
photeinosImg.src = "https://kathy-torfs.github.io/Orthodoxeweg/images/photeinos_walk.png";
const OBSTACLES = { licht: "🪽", zonde: "💀" };

// -----------------------------
// Speler
// -----------------------------
const photeinos = {
  x: 100,
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
let vleugels = 0;
let level = 1;
let running = false;
let paused = false;
let nextObstacleTime = 0;

// Bloemen & wolkjes (voor sfeer)
let flowers = [];
let clouds = [];
function makeFlowers(count = 13) {
  flowers = [];
  for (let i = 0; i < count; i++) {
    flowers.push({
      x: Math.random() * canvas.width,
      y: grassTop + Math.random() * (zoneHeight - 25),
      glyph: ["🌷","🌻","🌼","🌸","🌹","🌺","🌿","🍀"][Math.floor(Math.random()*8)]
    });
  }
}
function makeClouds(count = 6) {
  clouds = [];
  for (let i = 0; i < count; i++) {
    clouds.push({
      x: Math.random() * canvas.width,
      y: 30 + Math.random() * (zoneHeight-50),
      size: 25 + Math.random()*20
    });
  }
}
makeFlowers();
makeClouds();

// -----------------------------
// Input (keyboard & touch)
// -----------------------------
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);
canvas.addEventListener("touchstart", () => jump());

// -----------------------------
// Jump
// -----------------------------
function jump() {
  if (!photeinos.jumping) {
    photeinos.vy = -22.5;
    photeinos.jumping = true;
  }
}

// -----------------------------
// Obstakels
// -----------------------------
function spawnObstacle(force) {
  // Niet meer dan 2 tegelijk actief!
  if (!force && obstacles.filter(o=>o.actief).length >= 2) return;
  // Obstakels: wissel tussen lucht/gras
  const soort = Math.random() < 0.6 ? "licht" : "zonde";
  const hoogte = Math.random() < 0.5 ? 0 : 1;
  obstacles.push({
    x: canvas.width,
    y: OBSTACLE_HEIGHTS[hoogte],
    w: obSize,
    h: obSize,
    soort,
    hoogte, // 0 = gras, 1 = lucht
    actief: true
  });
}

// -----------------------------
// Player update
// -----------------------------
function updatePlayer() {
  if (keys[" "]) jump();

  photeinos.vy += 1.09;
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

// -----------------------------
// Collision (strak: midden op midden)
// -----------------------------
function rectsOverlap(a, b) {
  // Alleen botsing als centers overlappen minimaal 50%
  const ax = a.x + a.w/2, ay = a.y + a.h/2;
  const bx = b.x + b.w/2, by = b.y + b.h/2;
  const dx = Math.abs(ax - bx);
  const dy = Math.abs(ay - by);
  return (dx < (a.w+b.w)*0.30) && (dy < (a.h+b.h)*0.30);
}

function collisionCheck(ob) {
  // Gras: geraakt als je NIET springt (laag), lucht: geraakt als je springt (hoog)
  if (!rectsOverlap(photeinos, ob)) return false;
  if (ob.hoogte === 0) {
    // Gras-obstakel: geraakt als onderkant van Photeinos NIET boven gras
    return !photeinos.jumping && (photeinos.y + photeinos.h > grassTop);
  } else {
    // Lucht-obstakel: geraakt als Photeinos SPRINGT en met hoofd in luchtzone zit
    return photeinos.jumping && (photeinos.y + photeinos.h < grassTop + obSize*1.2);
  }
}

// -----------------------------
// Update loop
// -----------------------------
function update() {
  if (!running || paused) return;
  updatePlayer();

  // Obstakels laten bewegen
  obstacles.forEach(o => o.x -= obstacleSpeed);

  // Obstakels blijven tot buiten beeld of botsing
  obstacles = obstacles.filter(o => (o.x + o.w > 0 && o.actief) || !o.actief);

  // Nieuwe obstakels met voldoende pauze
  if (performance.now() > nextObstacleTime && obstacles.filter(o=>o.actief).length < 2) {
    spawnObstacle(true);
    // Volgende komt over min. 4,5 - 7 sec
    nextObstacleTime = performance.now() + 4500 + Math.random()*2500;
  }

  // Collision check
  for (let i = 0; i < obstacles.length; i++) {
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

  // wolkjes
  ctx.font = "27px Arial";
  clouds.forEach(c => {
    ctx.globalAlpha = 0.90;
    ctx.fillText("☁️", c.x, c.y);
    c.x -= 0.24;
    if (c.x < -35) c.x = canvas.width + 40;
  });
  ctx.globalAlpha = 1;

  // gras
  ctx.fillStyle = "#8BC34A";
  ctx.fillRect(0, grassTop, canvas.width, zoneHeight);

  // bloemen
  ctx.font = "22px Arial";
  flowers.forEach(f => {
    ctx.fillText(f.glyph, f.x, f.y);
    f.x -= 0.31;
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
// Controls: start/pauze (JS-only!)
// -----------------------------
function removeOldButtons() {
  let b1 = document.getElementById("startBtn");
  let b2 = document.getElementById("pauseBtn");
  if (b1) b1.remove();
  if (b2) b2.remove();
}
removeOldButtons();

const startBtn = document.createElement("button");
startBtn.innerText = "▶ Start spel (-20 punten)";
startBtn.id = "startBtn";
Object.assign(startBtn.style, {
  position:"absolute", bottom:"30px", right:"180px", padding:"15px 25px",
  fontSize:"20px", background:"#7bb235", color:"white", border:"none",
  borderRadius:"12px", cursor:"pointer"
});
document.body.appendChild(startBtn);

startBtn.onclick = () => {
  running = true;
  vleugels = 0;
  level = 1;
  obstacles = [];
  photeinos.vy = 0;
  photeinos.jumping = false;
  photeinos.y = canvas.height - photeinos.h;
  makeFlowers();
  makeClouds();
  nextObstacleTime = performance.now() + 1200;
};

const pauseBtn = document.createElement("button");
pauseBtn.innerText = "⏸ Pauze";
pauseBtn.id = "pauseBtn";
Object.assign(pauseBtn.style, {
  position:"absolute", bottom:"30px", right:"30px", padding:"15px 25px",
  fontSize:"20px", background:"#67510C", color:"white", border:"none",
  borderRadius:"12px", cursor:"pointer"
});
document.body.appendChild(pauseBtn);

pauseBtn.onclick = () => { paused = !paused; };

// -----------------------------
// Vraag overlay (onderaan scherm, geen OK nodig!)
// -----------------------------
function toonVraag(ob) {
  const overlay = document.getElementById("vraagOverlay");
  const vraagBox = document.getElementById("vraagBox");
  const tekst = document.getElementById("vraagTekst");
  const antwoorden = document.getElementById("vraagAntwoorden");

  // Zet overlay onderaan scherm
  Object.assign(overlay.style, {
    alignItems:"flex-end",
    justifyContent:"center"
  });
  Object.assign(vraagBox.style, {
    marginBottom:"50px"
  });

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

  // aantal antwoorden tonen volgens level
  let opties = [...q.a];
  if (level === 3) opties = opties.slice(0, 2);
  if (level === 4) opties = opties.slice(0, 3);

  // Direct verder na antwoord, geen OK meer!
  opties.forEach((optie, i) => {
    const btn = document.createElement("button");
    btn.innerText = optie;
    btn.onclick = () => {
      let goed = (i === q.correct);
      if (goed) {
        if (ob.soort === "licht") {
          vleugels++;
          if (vleugels >= 10) {
            level++;
            vleugels = 0;
            setTimeout(()=>alert("Proficiat! Je bent naar level " + level + " gegaan."),300);
          }
        }
        // Geen OK! Overlay verdwijnt, spel gaat direct verder:
        overlay.style.display = "none";
        paused = false;
      } else {
        if (ob.soort === "zonde") {
          overlay.style.display = "none";
          setTimeout(()=>alert("Fout bij zondevraag – Game Over!"),100);
          running = false;
        } else {
          // Fout bij vleugel: geen OK, direct verder:
          overlay.style.display = "none";
          paused = false;
        }
      }
    };
    antwoorden.appendChild(btn);
  });

  overlay.style.display = "flex";
}
