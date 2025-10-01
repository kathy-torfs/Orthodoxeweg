
// springspel.js

// -- Canvas & zones --
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const zoneHeight = H / 2, grassTop = H - zoneHeight;

// -- Speler/obstakel parameters --
const phW = 90, phH = 90, obSize = 50, obstacleSpeed = 2.1;

// -- Assets & emoji --
const photeinosImg = new Image();
photeinosImg.src = "https://kathy-torfs.github.io/Orthodoxeweg/images/photeinos_walk.png";
const OBSTACLES = { vleugel: "🪽", dood: "💀" };

// -- Speler --
const photeinos = { x: 110, y: H-phH, w:phW, h:phH, vy:0, jumping:false };

// -- Bloemen & wolkjes --
let flowers = [], clouds = [];
function makeFlowers(n=14) {
  flowers = [];
  for(let i=0; i<n; i++) flowers.push({
    x: Math.random()*W,
    y: grassTop + Math.random()*(zoneHeight-22),
    glyph: ["🌷","🌻","🌼","🌸","🌹","🌺","🌿","🍀"][Math.floor(Math.random()*8)]
  });
}
function makeClouds(n=7) {
  clouds = [];
  for(let i=0; i<n; i++) clouds.push({
    x: Math.random()*W,
    y: 30 + Math.random()*(zoneHeight-55),
    size: 25 + Math.random()*20
  });
}

// -- Game state --
let running=false, paused=false, level=1, vleugels=0, punten=100, obstacles=[], keys={}, obstTimer=0;

// -- Input --
document.addEventListener("keydown", e => keys[e.key]=true);
document.addEventListener("keyup", e => keys[e.key]=false);
canvas.addEventListener("touchstart", jump);
window.onkeydown = e => { if(e.key===" ") jump(); };

function jump() {
  if (!photeinos.jumping && running && !paused) {
    photeinos.vy = -18.5; photeinos.jumping = true;
  }
}

// -- Obstakel logica --
function spawnObstacle() {
  if (!running || paused || obstacles.length>=2) return;
  let soort = Math.random()<0.47 ? "vleugel" : "dood";
  let y = soort==="vleugel"
    ? grassTop-zoneHeight/2+25 // zwevend in lucht
    : H-obSize+7;              // op gras
  obstacles.push({ x:W+20, y, w:obSize, h:obSize, soort, actief:true });
}

function updateObstacles() {
  for(let o of obstacles) o.x -= obstacleSpeed;
  obstacles = obstacles.filter(o => o.x+o.w>0 && o.actief);
}

// -- Collision precies --
function checkCollision(a, b) {
  return (a.x+10 < b.x+b.w-10 &&
          a.x+a.w-10 > b.x+10 &&
          a.y+10 < b.y+b.h-10 &&
          a.y+a.h-12 > b.y+8);
}

// -- Speler update --
function updatePlayer() {
  photeinos.vy += 1.05; photeinos.y += photeinos.vy;
  if (photeinos.y + photeinos.h >= H) {
    photeinos.y = H-photeinos.h; photeinos.jumping = false; photeinos.vy = 0;
  }
  if (photeinos.y < 0) { photeinos.y = 0; photeinos.vy = 0; }
}

// -- Obstakel interactie --
function checkObstacles() {
  for (let o of obstacles) {
    if (!o.actief) continue;
    let geraakt = checkCollision(photeinos, o);
    if (o.soort==="dood" && geraakt && !photeinos.jumping) {
      running = false;
      setStatus("Game Over! Probeer opnieuw.");
      o.actief = false;
    }
    if (o.soort==="vleugel" && geraakt && photeinos.jumping) {
      vleugels++; o.actief = false;
      setStatus(`Level: ${level}  Vleugels: ${vleugels}  Punten: ${punten}`);
      if (vleugels>=10) {
        vleugels = 0; level++;
        setStatus(`Niveau omhoog! Nu level ${level}.`);
        if (level>5) {
          punten += 10;
          running = false;
          setStatus(`Gefeliciteerd! Je hebt alles gehaald! +10 punten`);
        }
      }
    }
  }
}

// -- Tekenen --
function draw() {
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#aee7ff"; ctx.fillRect(0,0,W,zoneHeight);
  // wolkjes
  ctx.font = "28px Arial";
  clouds.forEach(c => {
    ctx.globalAlpha = 0.92;
    ctx.fillText("☁️", c.x, c.y);
    c.x -= 0.23;
    if (c.x < -35) c.x = W + 40;
  });
  ctx.globalAlpha = 1;
  ctx.fillStyle="#8BC34A"; ctx.fillRect(0,grassTop,W,zoneHeight);
  // bloemen
  ctx.font = "22px Arial";
  flowers.forEach(f => {
    ctx.fillText(f.glyph, f.x, f.y);
    f.x -= 0.19;
    if (f.x < -15) f.x = W + 15;
  });
  // obstakels
  ctx.font = `${obSize}px Arial`;
  obstacles.forEach(o => ctx.fillText(OBSTACLES[o.soort], o.x, o.y+o.h-6));
  // photeinos
  ctx.drawImage(photeinosImg, photeinos.x, photeinos.y, photeinos.w, photeinos.h);
  // score
  ctx.fillStyle="#0a275b";
  ctx.font="22px Comic Sans MS";
  ctx.fillText(`Level: ${level} | Vleugels: ${vleugels} | Punten: ${punten}`, 25,38);
}

// -- Game loop --
function loop() {
  if (running) {
    updatePlayer();
    updateObstacles();
    checkObstacles();
  }
  draw();
  requestAnimationFrame(loop);
}
loop();

// -- Status updater --
function setStatus(txt) {
  document.getElementById("status").innerText = txt;
}

// -- Controls --
document.getElementById("startBtn").onclick = () => {
  if (punten < 20 && !running) return alert("Niet genoeg punten!");
  if (!running) punten -= 20;
  running = true; paused = false;
  vleugels = 0; level = 1; obstacles = [];
  photeinos.y = H-phH; photeinos.vy = 0; photeinos.jumping = false;
  makeFlowers(); makeClouds();
  setStatus(`Level: ${level}  Vleugels: ${vleugels}  Punten: ${punten}`);
};
document.getElementById("pauseBtn").onclick = () => { paused = !paused; };

// -- Obstakel spawner met interval --
setInterval(() => { if(running && !paused) spawnObstacle(); }, 3800);

// -- Vraag overlay NIET gebruikt, maar je kunt makkelijk je vraaglogica hier toevoegen als je wilt --
