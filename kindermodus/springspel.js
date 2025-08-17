// kindermodus/springspel.js

(function(){
  let canvas, ctx;
  let photeinos, obstacles = [], collectibles = [];
  let gameRunning = false, wings = 0, level = 1;
  let gravity = 0.6, jumpPower = -10, velocity = 0;
  let gameLoopInterval;
  let questionActive = false;

  // Firebase referentie
  const parochieId = localStorage.getItem("ingelogdeParochie");
  const ouderLogin = localStorage.getItem("loginKeuze");
  const kindId     = localStorage.getItem("ingelogdKindId");
  const kindDocRef = firebase.firestore()
    .collection("parochies").doc(parochieId)
    .collection("leden").doc(ouderLogin)
    .collection("kinderen").doc(kindId);

  // Levels & moeilijkheden
  const levelSettings = {
    1: { bg: "level1.png", difficulty: 1, answersToShow: 2 },
    2: { bg: "level2.png", difficulty: 1, answersToShow: 3 },
    3: { bg: "level3.png", difficulty: 1, answersToShow: 4 },
    4: { bg: "level4.png", difficulty: 2, answersToShow: 4 },
    5: { bg: "level5.png", difficulty: 3, answersToShow: 4 }
  };

  // Startknop
  async function betaalStart(){
    const snap = await kindDocRef.get();
    const punten = snap.exists ? (snap.data().punten||0) : 0;

    if(punten < 20){
      alert("Je hebt niet genoeg punten om te spelen (20 nodig).");
      return;
    }

    await kindDocRef.update({ punten: firebase.firestore.FieldValue.increment(-20) });
    document.getElementById("startBtn").style.display="none";
    initGame();
  }

  // Init spel
  function initGame(){
    canvas = document.createElement("canvas");
    canvas.width = document.getElementById("gameContainer").clientWidth;
    canvas.height = document.getElementById("gameContainer").clientHeight;
    document.getElementById("gameContainer").appendChild(canvas);
    ctx = canvas.getContext("2d");

    photeinos = { x: 50, y: canvas.height-120, w: 60, h: 60 };

    document.addEventListener("keydown", (e)=>{ if(e.code==="Space") jump(); });

    startLevel(1);
  }

  function startLevel(nr){
    level = nr; wings = 0; obstacles = []; collectibles = []; questionActive=false;

    let settings = levelSettings[level];
    document.getElementById("gameContainer").style.background =
      `url('https://kathy-torfs.github.io/Orthodoxeweg/images/${settings.bg}') repeat-x`;
    document.getElementById("gameContainer").style.backgroundSize = "cover";

    if(gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, 1000/60);
    gameRunning = true;
  }

  function jump(){
    if(!gameRunning) return;
    velocity = jumpPower;
  }

  // MAIN LOOP
  function gameLoop(){
    if(!gameRunning) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // zwaartekracht
    velocity += gravity;
    photeinos.y += velocity;
    if(photeinos.y > canvas.height - photeinos.h){
      photeinos.y = canvas.height - photeinos.h;
      velocity = 0;
    }

    // teken Photeinos (sterretje)
    ctx.font="50px serif";
    ctx.fillText("⭐", photeinos.x, photeinos.y);

    // obstakels (grond)
    if(Math.random()<0.02){
      const opties = ["🪨","🔥","🐍"];
      obstacles.push({x:canvas.width, y:canvas.height-20, w:60,h:60, emoji:opties[Math.floor(Math.random()*opties.length)]});
    }

    for(let i=obstacles.length-1;i>=0;i--){
      let o=obstacles[i];
      o.x -= 4;
      ctx.font="50px serif";
      ctx.fillText(o.emoji, o.x, o.y);

      if(collides(photeinos,o) && !questionActive){
        askZondeVraag(); return;
      }
      if(o.x+o.w<0) obstacles.splice(i,1);
    }

    // collectibles (duifjes, vleugeltjes, engeltjes)
if(Math.random()<0.02){
  const opties = ["🕊","🪽","👼"];
  collectibles.push({
    x: canvas.width,
    y: Math.random()*(canvas.height-150)+150,
    w: 50, h: 50, t: 0,
    emoji: opties[Math.floor(Math.random()*opties.length)]
  });
}

for(let i=collectibles.length-1;i>=0;i--){
  let c = collectibles[i];
  c.x -= 2.5; c.t += 0.1;
  let offsetY = Math.sin(c.t)*8;
  ctx.font="40px serif";
  ctx.fillText(c.emoji, c.x, c.y+offsetY);
  ...
}


      if(collides(photeinos,c)){
        collectibles.splice(i,1);
        wings++;
        if(wings>=10 && !questionActive){
          askCatecheseVraag(); return;
        }
      } else if(c.x+c.w<0){ collectibles.splice(i,1); }
    }

    // HUD
    ctx.fillStyle="black"; ctx.font="20px Comic Sans MS";
    ctx.fillText("Vleugeltjes: "+wings+"/10",20,30);
    ctx.fillText("Level: "+level,20,60);
  }

  function collides(a,b){
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }

  // Zondevraag
  function askZondeVraag(){
    clearInterval(gameLoopInterval); gameRunning=false; questionActive=true;
    const qBox=document.getElementById("questionBox");
    const qText=document.getElementById("questionText");
    const ansDiv=document.getElementById("answers"); ansDiv.innerHTML="";

    let pool = vragen.filter(v => v.difficulty==="zonde");
    let vraag = pool[Math.floor(Math.random()*pool.length)];
    qText.textContent=vraag.q;

    vraag.a.forEach((antwoord,i)=>{
      let btn=document.createElement("button");
      btn.textContent=antwoord;
      btn.onclick=()=>{
        if(i===vraag.correct){
          qBox.style.display="none"; resumeGame();
        }else{
          qBox.textContent="Game Over 😢"; ansDiv.innerHTML="";
          setTimeout(()=>{ window.location.reload(); },2000);
        }
      };
      ansDiv.appendChild(btn);
    });

    qBox.style.display="block";
  }

  // Catechese-vraag
  async function askCatecheseVraag(){
    clearInterval(gameLoopInterval); gameRunning=false; questionActive=true;
    const qBox=document.getElementById("questionBox");
    const qText=document.getElementById("questionText");
    const ansDiv=document.getElementById("answers"); ansDiv.innerHTML="";

    let settings=levelSettings[level];
    let pool=vragen.filter(v=>v.difficulty==settings.difficulty);
    let vraag=pool[Math.floor(Math.random()*pool.length)];
    qText.textContent=vraag.q;

    let shuffled=[...vraag.a].map((a,i)=>({txt:a,index:i}));
    shuffled.sort(()=>Math.random()-0.5);
    shuffled=shuffled.slice(0, settings.answersToShow);
    if(!shuffled.some(s=>s.index===vraag.correct)){
      shuffled[0]={txt:vraag.a[vraag.correct], index:vraag.correct};
    }

    shuffled.forEach(s=>{
      let btn=document.createElement("button");
      btn.textContent=s.txt;
      btn.onclick=async()=>{
        if(s.index===vraag.correct){
          qBox.style.display="none";
          await kindDocRef.update({ punten: firebase.firestore.FieldValue.increment(2) });
          if(level<5){ startLevel(level+1); }
          else{ alert("Proficiat! Alle levels gehaald!"); document.getElementById("startBtn").style.display="block"; }
        }else{
          qBox.style.display="none"; startLevel(level);
        }
      };
      ansDiv.appendChild(btn);
    });

    qBox.style.display="block";
  }

  function resumeGame(){
    gameLoopInterval=setInterval(gameLoop,1000/60);
    gameRunning=true; questionActive=false;
  }

  // Startknop toevoegen
  document.addEventListener("DOMContentLoaded", ()=>{
    const btn=document.createElement("button");
    btn.id="startBtn";
    btn.textContent="Start spel (20 punten)";
    btn.style="padding:15px 25px;font-size:1.2em;margin:20px auto;display:block;";
    btn.onclick=betaalStart;
    document.getElementById("gameContainer").appendChild(btn);
  });

  window.startLevel=startLevel;
})();
