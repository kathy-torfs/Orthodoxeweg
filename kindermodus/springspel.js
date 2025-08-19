// ================== CANVAS ================== 
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.5; // 50% hoogte
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ================== IMAGES ==================
const photeinosImg = new Image();
photeinosImg.src = "https://kathy-torfs.github.io/Orthodoxeweg/images/photeinos_walk.png";

const levelBackgrounds = [
  "https://kathy-torfs.github.io/Orthodoxeweg/images/level1.png",
  "https://kathy-torfs.github.io/Orthodoxeweg/images/level2.png",
  "https://kathy-torfs.github.io/Orthodoxeweg/images/level3.png",
  "https://kathy-torfs.github.io/Orthodoxeweg/images/level4.png",
  "https://kathy-torfs.github.io/Orthodoxeweg/images/level5.png"
].map(src => { let i=new Image(); i.src=src; return i; });

const collectableImgs = [
  "https://kathy-torfs.github.io/Orthodoxeweg/images/duif.png",
  "https://kathy-torfs.github.io/Orthodoxeweg/images/vleugel.png",
  "https://kathy-torfs.github.io/Orthodoxeweg/images/engel.png"
].map(src => { let i=new Image(); i.src=src; return i; });

// ================== SPELER ==================
const photeinos = { x: 50, y: 0, w: 90, h: 90, vy: 0, onGround: false }; // groter gemaakt
const gravity = 1, jumpPower = -18, speed = 7;
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function updatePlayer() {
  if (keys["ArrowRight"]) photeinos.x += speed;
  if (keys["ArrowLeft"]) photeinos.x -= speed;
  if (keys[" "] && photeinos.onGround) {
    photeinos.vy = jumpPower;
    photeinos.onGround = false;
  }
  photeinos.vy += gravity;
  photeinos.y += photeinos.vy;
  if (photeinos.y + photeinos.h > canvas.height) {
    photeinos.y = canvas.height - photeinos.h;
    photeinos.vy = 0;
    photeinos.onGround = true;
  }
}
function drawPlayer() {
  ctx.drawImage(photeinosImg, photeinos.x, photeinos.y, photeinos.w, photeinos.h);
}

// ================== OBSTACLES ==================
let obstacles = [];
function spawnObstacle() {
  obstacles.push({ x: canvas.width, y: canvas.height - 60, w: 70, h: 60 }); // groter gemaakt
}
function updateObstacles() {
  obstacles.forEach(o => o.x -= 5);
  obstacles = obstacles.filter(o => o.x + o.w > 0);
}
function drawObstacles() {
  ctx.fillStyle = "brown";
  obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));
}

// ================== COLLECTABLES ==================
let collectables = [];
function spawnCollectable() {
  const img = collectableImgs[Math.floor(Math.random() * collectableImgs.length)];
  const y = canvas.height - 150 - Math.random() * 100;
  collectables.push({ x: canvas.width, y, w: 60, h: 60, img }); // groter gemaakt
}
function updateCollectables() {
  collectables.forEach(c => c.x -= 4);
  collectables = collectables.filter(c => c.x + c.w > 0);
}
function drawCollectables() {
  collectables.forEach(c => ctx.drawImage(c.img, c.x, c.y, c.w, c.h));
}

// ================== VRAGEN ==================
let score = 0, level = 0;
let awaitingAnswer = false;

function askQuestion(type, onCorrect, onWrong) {
  if (awaitingAnswer) return;
  awaitingAnswer = true;
  const pool = questions.filter(q => q.difficulty === type);
  const q = pool[Math.floor(Math.random() * pool.length)];

  const overlay = document.createElement("div");
  Object.assign(overlay.style,{
    position:"fixed",top:0,left:0,right:0,bottom:0,
    background:"rgba(0,0,0,0.8)",color:"white",
    display:"flex",flexDirection:"column",
    justifyContent:"center",alignItems:"center",zIndex:"9999"
  });
  const vraag=document.createElement("p");
  vraag.innerText=q.q;
  vraag.style.fontSize="24px";vraag.style.marginBottom="20px";
  overlay.appendChild(vraag);

  q.a.forEach((ans,i)=>{
    const btn=document.createElement("button");
    btn.innerText=ans;
    btn.style.margin="6px";btn.style.padding="10px 18px";btn.style.fontSize="18px";
    btn.onclick=()=>{
      document.body.removeChild(overlay); awaitingAnswer=false;
      if(i===q.correct){ onCorrect(); } else { onWrong(); }
    };
    overlay.appendChild(btn);
  });
  document.body.appendChild(overlay);
}

// ================== GAME CONTROL ==================
let gameRunning=false;
let paused=false;

function gameLoop(){
  if(!gameRunning||paused) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(levelBackgrounds[level],0,0,canvas.width,canvas.height);

  updatePlayer(); updateObstacles(); updateCollectables();
  drawObstacles(); drawCollectables(); drawPlayer();

  // Obstacles
  obstacles.forEach(o=>{
    if(photeinos.x<o.x+o.w && photeinos.x+photeinos.w>o.x && photeinos.y<o.y+o.h && photeinos.y+photeinos.h>o.y){
      askQuestion("zonde",
        ()=>{}, // juist: niets
        ()=>{ alert("Game Over!"); location.reload(); }
      );
    }
  });
  // Collectables
  collectables.forEach((c,idx)=>{
    if(photeinos.x<c.x+c.w && photeinos.x+photeinos.w>c.x && photeinos.y<c.y+c.h && photeinos.y+photeinos.h>c.y){
      collectables.splice(idx,1);
      askQuestion("meerkeuze",
        ()=>{
          score++;
          if(score>=10){
            score=0;level++;
            if(level>=levelBackgrounds.length){alert("Proficiat! Alle levels gehaald!");location.reload();}
          }
        },
        ()=>{ alert("Fout antwoord – probeer opnieuw!"); }
      );
    }
  });

  requestAnimationFrame(gameLoop);
}

// ================== UI KNOPPEN ==================

// Startknop
const startBtn=document.createElement("button");
startBtn.innerText="Start spel (kost 20 punten)";
Object.assign(startBtn.style,{
  position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
  padding:"20px 30px",fontSize:"22px",zIndex:"1000"
});
document.body.appendChild(startBtn);

startBtn.onclick=()=>{
  document.body.removeChild(startBtn);
  gameRunning=true;
  score=0;level=0;obstacles=[];collectables=[];
  spawnObstacle(); spawnCollectable();
  gameLoop();
};

// Pauzeknop
const pauseBtn=document.createElement("button");
pauseBtn.innerText="⏸ Pauze";
Object.assign(pauseBtn.style,{
  position:"absolute",top:"20px",right:"20px",padding:"10px 18px",
  fontSize:"18px",zIndex:"1000"
});
document.body.appendChild(pauseBtn);

pauseBtn.onclick=()=>{
  paused=!paused;
  pauseBtn.innerText=paused?"▶ Hervat":"⏸ Pauze";
  if(!paused) gameLoop();
};

// ================== SPAWN TIMERS ==================
setInterval(()=>{ if(gameRunning && !paused) spawnObstacle(); },4000);
setInterval(()=>{ if(gameRunning && !paused) spawnCollectable(); },3000);
