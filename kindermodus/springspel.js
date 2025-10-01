// springspel.js – Orthodoxe versie (alle logica, clean)
// === Canvas ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500;

// === Zones & Afmetingen ===
const zoneHeight = canvas.height / 2;
const grassTop = canvas.height - zoneHeight;
const phSize = canvas.height * 0.37;
const obSize = canvas.height * 0.18;
const obstacleSpeed = 1.1; // //nota// snelheid van obstakels

// === Assets ===
const photeinosImg = new Image();
photeinosImg.src = "https://kathy-torfs.github.io/Orthodoxeweg/images/photeinos_walk.png";
const OBSTACLES = { licht: "🪽", zonde: "💀" };

// === Speler ===
const photeinos = {
  x: 100,
  y: canvas.height - phSize,
  w: phSize,
  h: phSize,
  vy: 0,
  jumping: false
};

// === Game variabelen ===
let obstacles = [];
let vleugels = 0;
let level = 1;
let running = false;
let paused = false;
let keys = {};

// === Bloemen & wolkjes (worden niet steeds vernieuwd) ===
let flowers = [];
let clouds = [];
function makeFlowers(count = 14) {
  flowers = [];
  for (let i = 0; i < count; i++) {
    flowers.push({
      x: Math.random() * canvas.width,
      y: grassTop + Math.random() * (zoneHeight - 25),
      glyph: ["🌷","🌻","🌼","🌸","🌹","🌺","🌿","🍀"][Math.floor(Math.random()*8)]
    });
  }
}
function makeClouds(count = 7) {
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

// === Controls ===
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);
canvas.addEventListener("touchstart", () => jump());

// === Springen ===
function jump() {
  if (!photeinos.jumping) {
    photeinos.vy = -22;
    photeinos.jumping = true;
  }
}

// === Obstakels ===
function spawnObstacle() {
  // Nooit meer dan 2 tegelijk, en alleen als er wat tijd tussen zit:
  if (obstacles.length >= 2) return;
  // Check of laatste obstakel te dicht op de rand zit:
  if (obstacles.length > 0 && (canvas.width - obstacles[obstacles.length-1].x) < 240) return;

  const soort = Math.random() < 0.6 ? "licht" : "zonde";
  // Ofwel exact in gras, ofwel exact in lucht:
  const inGras = Math.random() < 0.5;
  obstacles.push({
    x: canvas.width,
    y: inGras ? (canvas.height - obSize) : (grassTop - obSize + 8),
    w: obSize,
    h: obSize,
    soort,
    inGras,
    actief: true,
    geraakt: false
  });
}

// === Player update ===
function updatePlayer() {
  if (keys[" "]) jump();

  photeinos.vy += 1.1; // zwaartekracht
  photeinos.y += photeinos.vy;

  // Op de grond/gras blijven
  if (photeinos.y + photeinos.h > canvas.height) {
    photeinos.y = canvas.height - photeinos.h;
    photeinos.vy = 0;
    photeinos.jumping = false;
  }
  // Niet boven luchtzone uitkomen
  if (photeinos.y < 0) {
    photeinos.y = 0;
    photeinos.vy = 0;
  }
}

// === Collision preciezer maken ===
function rectsOverlap(a, b) {
  // Gebruik 92% van breedte/hoogte zodat aanraken visueel klopt
  const padW = a.w * 0.08, padH = a.h * 0.08;
  return (
    a.x + padW < b.x + b.w - padW &&
    a.x + a.w - padW > b.x + padW &&
    a.y + padH < b.y + b.h - padH &&
    a.y + a.h - padH > b.y + padH
  );
}

function collisionCheck(ob) {
  if (!ob.actief) return false;
  if (!rectsOverlap(photeinos, ob)) return false;
  if (ob.inGras) {
    return !photeinos.jumping; // geraakt als niet springt
  } else {
    return photeinos.jumping;  // geraakt als springt
  }
}

// === Update loop ===
function update() {
  if (!running || paused) return;

  updatePlayer();

  // Obstakels laten bewegen
  obstacles.forEach(o => o.x -= obstacleSpeed);

  // Obstakels niet verwijderen bij springen, maar alleen als geraakt of uit beeld
  obstacles = obstacles.filter(o => o.x + o.w > 0 && !o.geraakt);

  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (o.actief && collisionCheck(o)) {
      paused = true;
      toonVraag(o, i);
      o.actief = false;
    }
  }
}

// === Draw loop ===
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // lucht
  ctx.fillStyle = "#aee7ff";
  ctx.fillRect(0, 0, canvas.width, zoneHeight);

  // wolkjes
  ctx.font = "28px Arial";
  clouds.forEach(c => {
    ctx.globalAlpha = 0.92;
    ctx.fillText("☁️", c.x, c.y);
    c.x -= 0.25;
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
    f.x -= 0.33;
    if (f.x < -15) f.x = canvas.width + 15;
  });

  // obstakels
  ctx.font = `${obSize}px Arial`;
  obstacles.forEach(o => {
    ctx.globalAlpha = o.actief ? 1 : 0.35;
    ctx.fillText(OBSTACLES[o.soort], o.x, o.y + o.h - 8);
    ctx.globalAlpha = 1;
  });

  // speler
  ctx.drawImage(photeinosImg, photeinos.x, photeinos.y, photeinos.w, photeinos.h);

  // score/level
  ctx.fillStyle = "black";
  ctx.font = "18px Comic Sans MS";
  ctx.fillText("Level: " + level + " | Vleugels: " + vleugels, 20, 25);
}

// === Main loop ===
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();

// === Controls: start/pauze ===
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
document.getElementById("pauseBtn").onclick = () => { paused = !paused; };

// === Spawners ===
setInterval(() => { if(running && !paused) spawnObstacle(); }, 5400);

// === Vraag overlay (zonder alerts) ===
function toonVraag(ob, index) {
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
            tekst.textContent = "Proficiat! Je bent naar level " + level + " gegaan!";
          } else {
            tekst.textContent = "Goed zo!";
          }
        } else {
          tekst.textContent = "Juist!";
        }
      } else {
        if (ob.soort === "zonde") {
          tekst.textContent = "Fout bij zondevraag – Game Over!";
          running = false;
        } else {
          tekst.textContent = "Dat is fout.";
        }
      }
      // Markeer obstakel als geraakt (dan verdwijnt hij na deze frame)
      ob.geraakt = true;
      setTimeout(() => {
        overlay.style.display = "none";
        paused = false;
      }, 800); // toon het juiste/fout nog even, dan verder
    };
    antwoorden.appendChild(btn);
  });

  overlay.style.display = "flex";
}
