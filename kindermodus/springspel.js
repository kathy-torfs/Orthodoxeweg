// --- Instellingen
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const photeinosImg = new Image();
photeinosImg.src = "https://kathy-torfs.github.io/Orthodoxeweg/images/photeinos_walk.png";
const OBSTACLES = { vleugel: "🪽", dood: "💀" };

// --- Zones & maten
const W = canvas.width, H = canvas.height;
const zoneHeight = H / 2, grassTop = H - zoneHeight;
const phW = H*0.23, phH = H*0.23;

// --- Spelstate
let punten = 40; // uit je Firestore halen!
let level = 1, vleugels = 0, running = false, paused = false;
let obstacles = [], keys = {};
let statusMsg = "";
let quizvragen = window.vragen || [
  {q:"Wie leerde ons het Onze Vader?", a:["Jezus","Mozes","Noach"], correct:0},
  {q:"Wat vieren we met Pasen?", a:["Verrijzenis van Jezus","Zonnewende"], correct:0}
];

// --- Bloemen en wolkjes (sfeer)
let flowers=[], clouds=[];
function makeFlowers() {
  flowers = [];
  for(let i=0;i<13;i++)
    flowers.push({x:Math.random()*W, y:grassTop+Math.random()*(zoneHeight-25),
      glyph:["🌷","🌻","🌼","🌸","🌹","🌺"][Math.floor(Math.random()*6)]});
}
function makeClouds() {
  clouds = [];
  for(let i=0;i<6;i++)
    clouds.push({x:Math.random()*W, y:35+Math.random()*(zoneHeight-55)});
}
makeFlowers(); makeClouds();

// --- Speler
const photeinos = { x:95, y:H-phH, w:phW, h:phH, vy:0, jumping:false };

// --- Input
document.addEventListener("keydown", e => { if (e.key===" "||e.key==="ArrowUp") jump(); });
canvas.addEventListener("touchstart", () => jump());

// --- Jump
function jump() {
  if (!photeinos.jumping && running && !paused) {
    photeinos.vy = -17.5; photeinos.jumping = true;
  }
}

// --- Obstakels
function spawnObstacle() {
  if (obstacles.length>=2 || !running) return;
  let soort = Math.random()<0.52 ? "vleugel" : "dood";
  let y = soort=="vleugel"
    ? grassTop-zoneHeight*0.40
    : (H-phH+8);
  obstacles.push({ x:W+10, y, w:44, h:44, soort, actief:true });
}
setInterval(spawnObstacle, 2500);

// --- Update player
function updatePlayer() {
  photeinos.vy += 1.12;
  photeinos.y += photeinos.vy;
  if (photeinos.y + photeinos.h > H) { photeinos.y = H-photeinos.h; photeinos.jumping = false; photeinos.vy = 0; }
  if (photeinos.y < 0) { photeinos.y = 0; photeinos.vy = 0; }
}

// --- Obstakels bewegen
function updateObstacles() {
  for (let o of obstacles) o.x -= 2.15;
  obstacles = obstacles.filter(o => o.x+o.w>0 && o.actief);
}

// --- Collision
function checkCollision(a, b) {
  // Strikter window: echte aanraking
  return (a.x+15 < b.x+b.w-5 && a.x+a.w-20 > b.x+5 &&
    a.y+14 < b.y+b.h-5 && a.y+a.h-13 > b.y+4);
}

function checkObstacles() {
  for (let o of obstacles) {
    if (!o.actief) continue;
    let geraakt = checkCollision(photeinos, o);
    if (o.soort==="dood" && geraakt && !photeinos.jumping) {
      running = false;
      statusMsg = "Game Over! Probeer opnieuw.";
      o.actief = false;
      showQuiz("zonde", o);
    }
    if (o.soort==="vleugel" && geraakt && photeinos.jumping) {
      vleugels++; o.actief=false;
      if (vleugels>=10) {
        vleugels=0; level++;
        if (level>5) {
          punten+=10;
          running=false;
          statusMsg = `Knap! +10 punten verdiend!`;
        } else {
          statusMsg = `Level omhoog! Nu level ${level}.`;
        }
      }
      showQuiz("licht", o);
    }
  }
}

// --- Tekenen
function draw() {
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#aee7ff"; ctx.fillRect(0,0,W,zoneHeight);
  ctx.font="28px Arial";
  clouds.forEach(c=>{ ctx.globalAlpha=0.93; ctx.fillText("☁️",c.x,c.y); c.x-=0.25; if(c.x<-35)c.x=W+40;});
  ctx.globalAlpha=1;
  ctx.fillStyle="#8BC34A"; ctx.fillRect(0,grassTop,W,zoneHeight);
  ctx.font="22px Arial";
  flowers.forEach(f=>{ctx.fillText(f.glyph,f.x,f.y); f.x-=0.3;if(f.x<-15)f.x=W+15;});
  ctx.font = "43px Arial";
  obstacles.forEach(o=> ctx.fillText(OBSTACLES[o.soort], o.x, o.y+36));
  ctx.drawImage(photeinosImg, photeinos.x, photeinos.y, photeinos.w, photeinos.h);
}

function updateScoreBar(){
  document.getElementById("scoreText").innerText =
    `Level: ${level}  |  Vleugels: ${vleugels} / 10`;
  document.getElementById("puntentelling").innerText =
    `Punten: ${punten}`;
}

// --- Main loop
function loop() {
  if (running && !paused) {
    updatePlayer();
    updateObstacles();
    checkObstacles();
  }
  draw();
  updateScoreBar();
  requestAnimationFrame(loop);
}
loop();

// --- Controls
document.getElementById("startBtn").onclick = () => {
  if (punten<20 && !running) return alert("Niet genoeg punten om te spelen!");
  if (!running) punten -= 20;
  running = true; paused=false; vleugels=0; level=1; obstacles=[];
  photeinos.y=H-phH; photeinos.vy=0; photeinos.jumping=false;
  makeFlowers(); makeClouds(); statusMsg="";
};
document.getElementById("pauseBtn").onclick = () => { paused=!paused; };

// --- Quiz overlay
function showQuiz(type, obstakel) {
  const overlay = document.getElementById("vraagOverlay");
  const tekst = document.getElementById("vraagTekst");
  const antwoorden = document.getElementById("vraagAntwoorden");
  overlay.style.display="flex";
  antwoorden.innerHTML = "";
  let vraag;
  if (type=="licht") {
    // Gebruik moeilijkere vragen naarmate het level stijgt
    vraag = quizvragen[Math.floor(Math.random()*quizvragen.length)];
  } else {
    vraag = {q:"Je mag geen doodskop aanraken. Begrijp je dat?",a:["Ja","Nee"], correct:0};
  }
  tekst.textContent = vraag.q;
  vraag.a.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = ()=>{
      overlay.style.display="none";
      paused = false;
      if(type==="zonde" && i!==vraag.correct) {
        running = false;
        statusMsg = "Jammer! Probeer opnieuw.";
      } else if(type==="licht" && i===vraag.correct) {
        statusMsg = "Goed zo!";
      }
    };
    antwoorden.appendChild(btn);
  });
}

// --- Init display
updateScoreBar();
