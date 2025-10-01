// =============================
// springspel.js
// =============================

// Canvas & context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500;

// Zones
const zoneHeight = canvas.height / 2;
const grassTop = canvas.height - zoneHeight; // bovenkant gras

// Afmetingen & snelheid
const phSize = canvas.height * 0.37;
const obSize = canvas.height * 0.18;
const obstacleSpeed = 1.2;
const minObstacleDelay = 3800; // minimaal zoveel ms tussen obstakels
let lastObstacleTime = 0;

// Assets
const photeinosImg = new Image();
photeinosImg.src = "https://kathy-torfs.github.io/Orthodoxeweg/images/photeinos_walk.png";
const OBSTACLES = { licht: "🪽", zonde: "💀" };

// Speler
const photeinos = {
  x: 100,
  y: canvas.height - phSize,
  w: phSize,
  h: phSize,
  vy: 0,
  jumping: false
};

// Game vars
let obstacles = [];
let keys = {};
let vleugels = 0;
let level = 1;
let running = false;
let paused = false;

// Sfeer
let flowers = [], clouds = [];
function makeFlowers(n=14) {
  flowers = [];
  for(let i=0; i<n; i++) flowers.push({
    x: Math.random()*canvas.width,
    y: grassTop+Math.random()*(zoneHeight-25),
    glyph: ["🌷","🌻","🌼","🌸","🌹","🌺","🌿","🍀"][Math.floor(Math.random()*8)]
  });
}
function makeClouds(n=7) {
  clouds = [];
  for(let i=0; i<n; i++) clouds.push({
    x: Math.random()*canvas.width,
    y: 30+Math.random()*(zoneHeight-50),
    size: 25+Math.random()*20
  });
}
makeFlowers();
makeClouds();

// Controls
document.addEventListener("keydown", e => keys[e.key]=true);
document.addEventListener("keyup", e => keys[e.key]=false);
canvas.addEventListener("touchstart", () => jump());

// Jump
function jump() {
  if(!photeinos.jumping){
    photeinos.vy = -22;
    photeinos.jumping = true;
  }
}

// Obstakels
function spawnObstacle() {
  if (obstacles.length >= 2 || !running || paused) return;
  // minDelay tussen obstakels
  let now = Date.now();
  if (now - lastObstacleTime < minObstacleDelay) return;
  lastObstacleTime = now;
  const soort = Math.random()<0.6 ? "licht" : "zonde";
  const inGras = Math.random()<0.5;
  obstacles.push({
    x: canvas.width,
    y: inGras ? (canvas.height - obSize) : (grassTop - obSize + 8),
    w: obSize,
    h: obSize,
    soort,
    inGras,
    actief: true,
    hit: false
  });
}

// Player update
function updatePlayer() {
  if (keys[" "]) jump();
  photeinos.vy += 1.1;
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

// Collision (nauwkeuriger rechthoek)
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
    // Alleen geraakt als Photeinos NIET springt (dus beneden)
    return !photeinos.jumping && (photeinos.y + photeinos.h >= ob.y);
  } else {
    // Alleen geraakt als Photeinos springt en in de lucht raakt
    return photeinos.jumping && (photeinos.y <= ob.y + ob.h);
  }
}

// Update-loop
function update() {
  if (!running || paused) return;
  updatePlayer();

  // Obstakels bewegen
  obstacles.forEach(o => o.x -= obstacleSpeed);

  // Na botsing meteen laten verdwijnen
  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (o.actief && collisionCheck(o)) {
      paused = true;
      toonVraag(o);
      o.actief = false;
      o.hit = true;
    }
  }
  // Obstakels verdwijnen uit beeld of bij hit
  obstacles = obstacles.filter(o => !o.hit && (o.x + o.w > 0));
}

// Teken alles
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Lucht
  ctx.fillStyle = "#aee7ff";
  ctx.fillRect(0,0,canvas.width,zoneHeight);

  // Wolken
  ctx.font = "28px Arial";
  clouds.forEach(c=>{
    ctx.globalAlpha = 0.92;
    ctx.fillText("☁️",c.x,c.y);
    c.x -= 0.25;
    if (c.x < -35) c.x = canvas.width+40;
  });
  ctx.globalAlpha = 1;

  // Gras
  ctx.fillStyle = "#8BC34A";
  ctx.fillRect(0,grassTop,canvas.width,zoneHeight);

  // Bloemen
  ctx.font = "22px Arial";
  flowers.forEach(f=>{
    ctx.fillText(f.glyph, f.x, f.y);
    f.x -= 0.33;
    if (f.x < -15) f.x = canvas.width+15;
  });

  // Obstakels
  ctx.font = `${obSize}px Arial`;
  obstacles.forEach(o=>{
    ctx.fillText(OBSTACLES[o.soort], o.x, o.y + o.h - 8);
  });

  // Speler
  ctx.drawImage(photeinosImg, photeinos.x, photeinos.y, photeinos.w, photeinos.h);

  // Score/level
  ctx.fillStyle = "black";
  ctx.font = "18px Comic Sans MS";
  ctx.fillText("Level: " + level + " | Vleugels: " + vleugels, 20, 25);
}

// Main loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();

// Start/Pauze knoppen (1x toevoegen, niet dubbel)
let btnsAdded = false;
function addBtns() {
  if (btnsAdded) return;
  btnsAdded = true;
  // Start
  const startBtn = document.getElementById("startBtn");
  startBtn.onclick = () => {
    running = true;
    vleugels = 0;
    level = 1;
    obstacles = [];
    photeinos.vy = 0;
    photeinos.jumping = false;
    photeinos.y = canvas.height - photeinos.h;
    makeFlowers(); makeClouds();
    paused = false;
  };
  // Pauze
  const pauseBtn = document.getElementById("pauseBtn");
  pauseBtn.onclick = () => { paused = !paused; };
}
setTimeout(addBtns, 400); // wachten tot HTML geladen

// Obstakels automatisch spawnen
setInterval(()=>{ spawnObstacle(); }, 5200);

// Vraag overlay (geen alert meer!)
function toonVraag(ob) {
  const overlay = document.getElementById("vraagOverlay");
  const tekst = document.getElementById("vraagTekst");
  const antwoorden = document.getElementById("vraagAntwoorden");
  let q;
  if (ob.soort === "licht") {
    let vragenLicht = vragen.filter(v=>v.difficulty==level);
    if (vragenLicht.length===0) {
      let maxLvl = Math.max(...vragen.filter(v=>typeof v.difficulty==="number").map(v=>v.difficulty));
      vragenLicht = vragen.filter(v=>v.difficulty==maxLvl);
    }
    q = vragenLicht[Math.floor(Math.random()*vragenLicht.length)];
  } else {
    const vragenZonde = vragen.filter(v=>v.difficulty==="zonde");
    q = vragenZonde[Math.floor(Math.random()*vragenZonde.length)];
  }
  tekst.textContent = q.q;
  antwoorden.innerHTML = "";
  let opties = [...q.a];
  if (level === 3) opties = opties.slice(0,2);
  if (level === 4) opties = opties.slice(0,3);

  opties.forEach((optie,i)=>{
    const btn = document.createElement("button");
    btn.innerText = optie;
    btn.onclick = () => {
      let goed = (i===q.correct);
      if (ob.soort==="licht" && goed) {
        vleugels++;
        if (vleugels>=10) {
          level++;
          vleugels = 0;
          tekst.textContent = "Proficiat! Je bent naar level " + level + " gegaan.";
          antwoorden.innerHTML = "";
          setTimeout(()=>{ overlay.style.display="none"; paused=false; }, 1200);
          return;
        }
        tekst.textContent = "Goed zo!";
        setTimeout(()=>{ overlay.style.display="none"; paused=false; }, 1000);
      } else if (ob.soort==="zonde" && !goed) {
        tekst.textContent = "Fout – Game Over!";
        running = false;
        setTimeout(()=>{ overlay.style.display="none"; }, 1500);
      } else {
        tekst.textContent = "Dat is fout.";
        setTimeout(()=>{ overlay.style.display="none"; paused=false; }, 1000);
      }
    };
    antwoorden.appendChild(btn);
  });
  overlay.style.display="flex";
}
