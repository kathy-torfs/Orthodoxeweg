// kindermodus/springspel.js

(function(){
  let canvas, ctx;
  let photeinos, velocity=0, gravity=0.6, jumpPower=-12;
  let obstacles=[], collectibles=[];
  let wings=0, level=1, gameRunning=false;
  let gameLoopInterval;
  let moveLeft=false, moveRight=false;

  // Afbeelding Photeinos (sterretje)
  const starImg = new Image();
  starImg.src="https://kathy-torfs.github.io/Orthodoxeweg/images/photeinos_walk.png";

  // Collectables (emoticons)
  const collectibleIcons = ["✨","🕊","👼","🪽"];
  // Obstakels (emoticon)
  const obstacleIcon = "🪨";

  // Firebase ref
  const parochieId = localStorage.getItem("ingelogdeParochie");
  const ouderLogin = localStorage.getItem("loginKeuze");
  const kindId     = localStorage.getItem("ingelogdKindId");
  const kindDocRef = firebase.firestore()
    .collection("parochies").doc(parochieId)
    .collection("leden").doc(ouderLogin)
    .collection("kinderen").doc(kindId);

  const levelSettings = {
    1: { bg: "level1.png", difficulty: 1, answersToShow: 2 },
    2: { bg: "level2.png", difficulty: 1, answersToShow: 3 },
    3: { bg: "level3.png", difficulty: 1, answersToShow: 4 },
    4: { bg: "level4.png", difficulty: 2, answersToShow: 4 },
    5: { bg: "level5.png", difficulty: 3, answersToShow: 4 }
  };

  // Startknop
  document.addEventListener("DOMContentLoaded", ()=>{
    const btn=document.createElement("button");
    btn.id="startBtn";
    btn.textContent="Start spel (20 punten)";
    btn.style="padding:15px 25px;font-size:1.2em;margin:20px auto;display:block;";
    btn.onclick=betaalStart;
    document.getElementById("gameContainer").appendChild(btn);
  });

  async function betaalStart(){
    const snap = await kindDocRef.get();
    const punten = snap.exists ? (snap.data().punten||0) : 0;
    if(punten<20){ alert("Je hebt niet genoeg punten (20 nodig)."); return; }
    await kindDocRef.update({ punten: firebase.firestore.FieldValue.increment(-20) });
    document.getElementById("startBtn").style.display="none";
    initGame();
  }

  function initGame(){
    canvas=document.createElement("canvas");
    canvas.width=document.getElementById("gameContainer").clientWidth;
    canvas.height=document.getElementById("gameContainer").clientHeight;
    document.getElementById("gameContainer").appendChild(canvas);
    ctx=canvas.getContext("2d");

    photeinos={x:50,y:canvas.height-120,w:60,h:60,flip:false};
    document.addEventListener("keydown",keyDown);
    document.addEventListener("keyup",keyUp);

    startLevel(1);
  }

  function keyDown(e){
    if(e.code==="ArrowLeft"){ moveLeft=true; photeinos.flip=true; }
    if(e.code==="ArrowRight"){ moveRight=true; photeinos.flip=false; }
    if(e.code==="Space"){ jump(); }
  }
  function keyUp(e){
    if(e.code==="ArrowLeft"){ moveLeft=false; }
    if(e.code==="ArrowRight"){ moveRight=false; }
  }

  function jump(){
    if(photeinos.y>=canvas.height-photeinos.h){ velocity=jumpPower; }
  }

  function startLevel(nr){
    level=nr; wings=0; obstacles=[]; collectibles=[];
    let settings=levelSettings[level];
    document.getElementById("gameContainer").style.background=`url('https://kathy-torfs.github.io/Orthodoxeweg/images/${settings.bg}') repeat-x`;
    document.getElementById("gameContainer").style.backgroundSize="cover";
    if(gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval=setInterval(gameLoop,1000/60);
    gameRunning=true;
  }

  function gameLoop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // beweging horizontaal
    if(moveLeft) photeinos.x=Math.max(0,photeinos.x-4);
    if(moveRight) photeinos.x=Math.min(canvas.width-photeinos.w,photeinos.x+4);

    // zwaartekracht
    velocity+=gravity;
    photeinos.y+=velocity;
    if(photeinos.y>canvas.height-photeinos.h){
      photeinos.y=canvas.height-photeinos.h; velocity=0;
    }

    // teken Photeinos
    ctx.save();
    if(photeinos.flip){ ctx.translate(photeinos.x+photeinos.w,0); ctx.scale(-1,1); ctx.drawImage(starImg,0,photeinos.y,photeinos.w,photeinos.h); }
    else { ctx.drawImage(starImg,photeinos.x,photeinos.y,photeinos.w,photeinos.h); }
    ctx.restore();

    // obstakels vast
    if(obstacles.length<3 && Math.random()<0.01){
      let x=Math.random()*(canvas.width-100)+100;
      obstacles.push({x:x,y:canvas.height-80,w:60,h:60});
    }
    obstacles.forEach(o=>{
      ctx.font="40px serif";
      ctx.fillText(obstacleIcon,o.x,o.y);
      if(collides(photeinos,o)){ askQuestion(true); return; }
    });

    // collectables van rechts
    if(Math.random()<0.02){
      let y=canvas.height-150; // vaste hoogte
      let icon=collectibleIcons[Math.floor(Math.random()*collectibleIcons.length)];
      collectibles.push({x:canvas.width,y:y,w:40,h:40,icon:icon});
    }
    for(let i=collectibles.length-1;i>=0;i--){
      let c=collectibles[i]; c.x-=2;
      ctx.font="30px serif"; ctx.fillText(c.icon,c.x,c.y);
      if(collides(photeinos,c)){
        collectibles.splice(i,1);
        wings++;
        askQuestion(false); // elke collectable → vraag
        return;
      } else if(c.x+c.w<0){ collectibles.splice(i,1); }
    }

    // HUD
    ctx.fillStyle="black"; ctx.font="20px Comic Sans MS";
    ctx.fillText("Vleugeltjes: "+wings,20,30);
    ctx.fillText("Level: "+level,20,60);

    // level gehaald?
    if(wings>=10){
      if(level<5){ startLevel(level+1); }
      else { alert("Proficiat, je hebt alles gehaald!"); document.getElementById("startBtn").style.display="block"; clearInterval(gameLoopInterval); }
    }
  }

  function collides(a,b){
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }

  async function askQuestion(failed){
    clearInterval(gameLoopInterval); gameRunning=false;
    const qBox=document.getElementById("questionBox");
    const qText=document.getElementById("questionText");
    const ansDiv=document.getElementById("answers");

    if(failed){
      let pool=vragen.filter(v=>v.difficulty==="zonde");
      let vraag=pool[Math.floor(Math.random()*pool.length)];
      qText.textContent=vraag.q; ansDiv.innerHTML="";
      vraag.a.forEach((ans,i)=>{
        let btn=document.createElement("button"); btn.textContent=ans;
        btn.onclick=()=>{
          if(i===vraag.correct){ qBox.style.display="none"; startLevel(level); }
          else { alert("Game Over"); document.getElementById("startBtn").style.display="block"; }
        };
        ansDiv.appendChild(btn);
      });
    } else {
      let settings=levelSettings[level];
      let pool=vragen.filter(v=>v.difficulty==settings.difficulty);
      let vraag=pool[Math.floor(Math.random()*pool.length)];
      qText.textContent=vraag.q; ansDiv.innerHTML="";
      vraag.a.forEach((ans,i)=>{
        let btn=document.createElement("button"); btn.textContent=ans;
        btn.onclick=async()=>{
          if(i===vraag.correct){
            await kindDocRef.update({ punten: firebase.firestore.FieldValue.increment(2) });
            qBox.style.display="none"; gameLoopInterval=setInterval(gameLoop,1000/60); gameRunning=true;
          } else { qBox.style.display="none"; startLevel(level); }
        };
        ansDiv.appendChild(btn);
      });
    }
    qBox.style.display="block";
  }

})();
