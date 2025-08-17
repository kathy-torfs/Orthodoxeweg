// kindermodus/springspel.js
(function(){
  let canvas, ctx;
  let photeinos, obstacles = [], collectibles = [];
  let gameRunning = false, wings = 0, level = 1;
  let gravity = 0.6, jumpPower = -10, velocity = 0;
  let gameLoopInterval;

  // Firebase referentie
  const parochieId = localStorage.getItem("ingelogdeParochie");
  const ouderLogin = localStorage.getItem("loginKeuze");
  const kindId     = localStorage.getItem("ingelogdKindId");
  const kindDocRef = firebase.firestore()
    .collection("parochies").doc(parochieId)
    .collection("leden").doc(ouderLogin)
    .collection("kinderen").doc(kindId);

  // Level instellingen
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

  function initGame(){
    canvas = document.createElement("canvas");
    canvas.width = document.getElementById("gameContainer").clientWidth;
    canvas.height = document.getElementById("gameContainer").clientHeight;
    document.getElementById("gameContainer").appendChild(canvas);
    ctx = canvas.getContext("2d");

    photeinos = { x: 50, y: canvas.height-80, w: 50, h: 50 };

    document.addEventListener("keydown", (e)=>{
      if(e.code === "Space") jump();
    });

    startLevel(1);
  }

  function startLevel(nr){
    level = nr;
    wings = 0;
    obstacles = [];
    collectibles = [];

    let settings = levelSettings[level];
    document.getElementById("gameContainer").style.background =
      `url('https://kathy-torfs.github.io/Orthodoxeweg/images/${settings.bg}') no-repeat center center`;
    document.getElementById("gameContainer").style.backgroundSize = "cover";

    // Plaats vaste obstakels
    obstacles.push({x: 300, y: canvas.height-70, w: 50, h: 50, emoji:"🪨"});
    obstacles.push({x: 600, y: canvas.height-70, w: 50, h: 50, emoji:"🔥"});
    obstacles.push({x: 900, y: canvas.height-70, w: 50, h: 50, emoji:"🐍"});

    if(gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, 1000/60);
    gameRunning = true;
  }

  function jump(){
    if(!gameRunning) return;
    velocity = jumpPower;
  }

  function gameLoop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // zwaartekracht
    velocity += gravity;
    photeinos.y += velocity;
    if(photeinos.y > canvas.height - photeinos.h){
      photeinos.y = canvas.height - photeinos.h;
      velocity = 0;
    }

    // teken speler (ster)
    ctx.font = "50px serif";
    ctx.fillText("✨", photeinos.x, photeinos.y);

    // teken obstakels (blijven vast staan)
    obstacles.forEach(o=>{
      ctx.font = "50px serif";
      ctx.fillText(o.emoji, o.x, o.y);
      if(collides(photeinos,o)){
        askQuestion("zonde");
        return;
      }
    });

    // spawn collectables (bewegend)
    if(Math.random()<0.02){
      const opties = ["🕊","🪽","👼"];
      collectibles.push({
        x: Math.random()* (canvas.width-100)+100,
        y: Math.random()*(canvas.height-200)+100,
        w: 40,h:40,emoji: opties[Math.floor(Math.random()*opties.length)], t:0
      });
    }

    for(let i=collectibles.length-1;i>=0;i--){
      let c=collectibles[i];
      c.t += 0.1;
      let offsetY = Math.sin(c.t)*8;
      ctx.font="40px serif";
      ctx.fillText(c.emoji, c.x, c.y+offsetY);

      if(collides(photeinos,c)){
        collectibles.splice(i,1);
        wings++;
        askQuestion("normaal");
        return;
      }
    }

    // HUD
    ctx.fillStyle="black";
    ctx.font="20px Comic Sans MS";
    ctx.fillText("Vleugeltjes: "+wings+"/10",20,30);
    ctx.fillText("Level: "+level,20,60);

    // check of speler rechts geraakt
    if(photeinos.x > canvas.width-60 && wings>=10){
      if(level<5){
        startLevel(level+1);
      }else{
        alert("Proficiat! Je hebt alle levels gehaald!");
        document.getElementById("startBtn").style.display="block";
        gameRunning=false;
        clearInterval(gameLoopInterval);
      }
    }
  }

  function collides(a,b){
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }

  // Vraag logica
  async function askQuestion(type){
    clearInterval(gameLoopInterval);
    gameRunning=false;

    const qBox = document.getElementById("questionBox");
    const qText= document.getElementById("questionText");
    const ansDiv=document.getElementById("answers");
    ansDiv.innerHTML="";

    let settings = levelSettings[level];
    let pool = vragen.filter(v=> v.difficulty==settings.difficulty);
    if(type==="zonde"){
      pool = vragen.filter(v=> v.difficulty=="zonde");
    }
    let vraag = pool[Math.floor(Math.random()*pool.length)];

    qText.textContent=vraag.q;

    let shuffled = [...vraag.a].map((a,i)=>({txt:a,index:i}));
    shuffled.sort(()=>Math.random()-0.5);
    shuffled = shuffled.slice(0, settings.answersToShow);
    if(!shuffled.some(s=>s.index===vraag.correct)){
      shuffled[0] = {txt:vraag.a[vraag.correct], index:vraag.correct};
    }

    shuffled.forEach(s=>{
      let btn=document.createElement("button");
      btn.textContent=s.txt;
      btn.onclick=async ()=>{
        if(s.index===vraag.correct){
          qBox.style.display="none";
          if(type==="normaal"){
            await kindDocRef.update({ punten: firebase.firestore.FieldValue.increment(2) });
          }
          gameLoopInterval=setInterval(gameLoop,1000/60);
          gameRunning=true;
        }else{
          if(type==="zonde"){
            alert("Fout antwoord bij zonde! Game over.");
            document.getElementById("startBtn").style.display="block";
          }else{
            alert("Fout antwoord, probeer opnieuw dit level.");
            startLevel(level);
          }
          qBox.style.display="none";
        }
      };
      ansDiv.appendChild(btn);
    });

    qBox.style.display="block";
  }

  // Startknop
  document.addEventListener("DOMContentLoaded", ()=>{
    const btn=document.createElement("button");
    btn.id="startBtn";
    btn.textContent="Start spel (20 punten)";
    btn.style="padding:15px 25px;font-size:1.2em;margin:20px auto;display:block;";
    btn.onclick=betaalStart;
    document.getElementById("gameContainer").appendChild(btn);
  });
})();
