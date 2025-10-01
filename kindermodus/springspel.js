// =============================
// springspel.js
// =============================

// Canvas & context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Dynamische grootte
canvas.width = 800;
canvas.height = 500;

// -----------------------------
// Zones
// -----------------------------
const zoneHeight = canvas.height / 2;
const grassTop = canvas.height - zoneHeight; // bovenste pixel van gras

// -----------------------------
// Afmetingen
// -----------------------------
//nota// Grootte van Photeinos
const phSize = canvas.height * 0.37; // 37% schermhoogte
//nota// Grootte van obstakels
const obSize = canvas.height * 0.17; // 17% schermhoogte
//nota// Snelheid van obstakels (lager = trager)
// -- PAS DIT AAN OM SPEL TE VERTRAGEN/SNELLER TE MAKEN --
const obstacleSpeed = 1.12;

// -----------------------------
// Assets
// -----------------------------
const photeinosImg = new Image();
photeinosImg.src = "https://kathy-torfs.github.io/Orthodoxeweg/images/photeinos_walk.png";
const OBSTACLES = { licht: "🪽", zonde: "💀" };

// -----------------------------
// Speler
// -----------------------------
//nota// Startpositie van Photeinos
const photeinos = {
  x: 100,
  y: canvas.height - phSize, // onderaan gras
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
let vleugels = 0;   // telt vleugeltjes (per level)
let level = 1;      // startniveau
let running = false;
let paused = false;

// -----------------------------
// Bloemen & wolkjes (voor sfeer)
// -----------------------------
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
// Jump (hoogte goed zichtbaar)
// -----------------------------
function jump() {
  if (!photeinos.jumping) {
    //nota// Springhoogte (meer negatief = hoger)
    photeinos.vy = -22.5;
    photeinos.jumping = true;
  }
}

// -----------------------------
// Obstakels
// -----------------------------
function spawnObstacle() {
  //nota// Maximaal 2 obstakels tegelijk op scherm
  if (obstacles.filter(o=>o.actief).length >= 2) return;

  const soort = Math.random() < 0.6 ? "licht" : "zonde";
  const inGras = Math.random() < 0.5;
  obstacles.push({
    x: canvas.width,
    y: inGras ? (canvas.height - obSize) : (grassTop - obSize + 7),
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

  photeinos.vy += 1.09; // zwaartekracht
  photeinos.y += photeinos.vy;

  // Ondergrond begrenzen (gras)
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
  if (!rectsOverlap(photeinos, ob)) return false;
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

  //nota// Snelheid obstakels: zie obstacleSpeed hierboven!
  obstacles.forEach(o => o.x -= obstacleSpeed);

  // Obstakels blijven tot buiten beeld of botsing
  obstacles = obstacles.filter(o => (o.x + o.w > 0 && o.actief) || !o.actief);

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
// Draw loop (met bloemen & wolkjes)
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
// Controls: start/pauze (JS-only, nooit dubbel!)
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
  vleugels = 0;
  level = 1;
  obstacles = [];
  photeinos.vy = 0;
  photeinos.jumping = false;
  photeinos.y = canvas.height - photeinos.h; // startpositie
  makeFlowers();
  makeClouds();
};

const pauseBtn = document.createElement("button");
pauseBtn.innerText = "⏸ Pauze";
pauseBtn.id = "pauseBtn";
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
setInterval(() => { if(running && !paused) spawnObstacle(); }, 6100);

// -----------------------------
// Vraag overlay
// -----------------------------
function toonVraag(ob) {
  const overlay = document.getElementById("vraagOverlay");
  const tekst = document.getElementById("vraagTekst");
  const antwoorden = document.getElementById("vraagAntwoorden");

  let q;
  if (ob.soort === "licht") {
    // Kies juiste moeilijkheidsgraad (level = difficulty)
    let vragenLicht = vragen.filter(v => v.difficulty == level);
    // Als er geen vragen meer zijn op dit niveau, neem hoogste difficulty
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
  // Level 5 en hoger: alles tonen

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
