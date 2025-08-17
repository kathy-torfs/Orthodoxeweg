// kindermodus/springspel.js

(function(){
  let canvas, ctx;
  let photeinos, obstacles = [], collectibles = [];
  let gameRunning = false, wings = 0, level = 1;
  let gravity = 0.6, jumpPower = -10, velocity = 0;
  let gameLoopInterval;

  // Firebase referenties (zoals elders in kindermodus)
  const parochieId = localStorage.getItem("ingelogdeParochie");
  const ouderLogin = localStorage.getItem("loginKeuze");
  const kindId     = localStorage.getItem("ingelogdKindId");
  const kindDocRef = firebase.firestore()
    .collection("parochies").doc(parochieId)
    .collection("leden").doc(ouderLogin)
    .collection("kinderen").doc(kindId);

  // Difficulty instellingen
  const levelSettings = {
    1: { bg: "level1.png", difficulty: 1, answersToShow: 2 },
    2: { bg: "level2.png", difficulty: 1, answersToShow: 3 },
    3: { bg: "level3.png", difficulty: 1, answersToShow: 4 },
    4: { bg: "level4.png", difficulty: 2, answersToShow: 4 },
    5: { bg: "level5.png", difficulty: 3, answersToShow: 4 }
  };

  // Startknop logica
  async function betaalStart(){
    const snap = await kindDocRef.get();
    const punten = snap.exists ? (snap.data().punten||0) : 0;

    if(punten < 20){
      alert("Je hebt niet genoeg punten om te spelen (20 nodig).");
      return;
    }

    // 20 punten aftrekken
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

    photeinos = { x: 50, y: canvas.height-120, w: 60, h: 60 };

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
    document.getElementById("gameContainer").style.background = `url('https://kathy-torfs.github.io/Orthodoxeweg/images/${settings.bg}') repeat-x`;
    document.getElementById("gameContainer").style.backgroundSize = "cover";

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

    // teken speler
    ctx.fillStyle = "yellow";
    ctx.fillRect(photeinos.x, photeinos.y, photeinos.w, photeinos.h);

    // spawn obstakels (grotere blokken)
    if(Math.random()<0.015){
      obstacles.push({x:canvas.width, y:canvas.height-100, w:100, h:100});
    }

    for(let i=obstacles.length-1;i>=0;i--){
      let o=obstacles[i];
      o.x -= 4;
      ctx.fillStyle="brown";
      ctx.fillRect(o.x,o.y,o.w,o.h);

      if(collides(photeinos,o)){
        // botsing → opnieuw level
        askQuestion(true); // true = gefaald
        return;
      }
      if(o.x+o.w<0) obstacles.splice(i,1);
    }

    // spawn collectibles (bewegende vleugeltjes)
    if(Math.random()<0.02){
      collectibles.push({x:canvas.width, y:Math.random()*(canvas.height-250)+80, w:40, h:40, t:0});
    }

    for(let i=collectibles.length-1;i>=0;i--){
      let c=collectibles[i];
      c.x -= 2.5;
      c.t += 0.1;
      let offsetY = Math.sin(c.t)*10;
      ctx.fillStyle="lightblue";
      ctx.beginPath();
      ctx.ellipse(c.x, c.y+offsetY, c.w/2, c.h/2, 0, 0, Math.PI*2);
      ctx.fill();

      if(collides(photeinos,c)){
        collectibles.splice(i,1);
        wings++;
        if(wings>=10){
          askQuestion(false);
          return;
        }
      } else if(c.x+c.w<0){
        collectibles.splice(i,1);
      }
    }

    // HUD
    ctx.fillStyle="black";
    ctx.font="20px Comic Sans MS";
    ctx.fillText("Vleugeltjes: "+wings+"/10",20,30);
    ctx.fillText("Level: "+level,20,60);
  }

  function collides(a,b){
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }

  // Vraag stellen
  async function askQuestion(failed){
    clearInterval(gameLoopInterval);
    gameRunning = false;

    const qBox = document.getElementById("questionBox");
    const qText = document.getElementById("questionText");
    const ansDiv = document.getElementById("answers");

    if(failed){
      qText.textContent="Oei! Je hebt een obstakel geraakt. Probeer opnieuw dit level!";
      ansDiv.innerHTML = `<button onclick="document.getElementById('questionBox').style.display='none'; startLevel(${level});">Opnieuw</button>`;
      qBox.style.display="block";
      return;
    }

    let settings = levelSettings[level];
    let pool = vragen.filter(v => v.difficulty == settings.difficulty);
    let vraag = pool[Math.floor(Math.random()*pool.length)];

    qText.textContent = vraag.q;
    ansDiv.innerHTML = "";

    // juiste aantal antwoorden tonen
    let shuffled = [...vraag.a].map((a,i)=>({txt:a,index:i}));
    shuffled.sort(()=>Math.random()-0.5);
    shuffled = shuffled.slice(0, settings.answersToShow);

    if(!shuffled.some(s => s.index===vraag.correct)){
      shuffled[0] = {txt:vraag.a[vraag.correct], index:vraag.correct};
    }

    shuffled.forEach(s=>{
      let btn=document.createElement("button");
      btn.textContent=s.txt;
      btn.onclick=async ()=>{
        if(s.index===vraag.correct){
          qBox.style.display="none";
          // ✅ 2 punten teruggeven
          await kindDocRef.update({ punten: firebase.firestore.FieldValue.increment(2) });
          if(level<5){
            startLevel(level+1);
          }else{
            alert("Proficiat! Je hebt alle levels gehaald!");
            document.getElementById("startBtn").style.display="block"; // opnieuw spelen
          }
        }else{
          qBox.style.display="none";
          startLevel(level);
        }
      };
      ansDiv.appendChild(btn);
    });

    qBox.style.display="block";
  }

  // Startknop zichtbaar maken
  document.addEventListener("DOMContentLoaded", ()=>{
    const btn=document.createElement("button");
    btn.id="startBtn";
    btn.textContent="Start spel (20 punten)";
    btn.style="padding:15px 25px;font-size:1.2em;margin:20px auto;display:block;";
    btn.onclick=betaalStart;
    document.getElementById("gameContainer").appendChild(btn);
  });

  // Exporteer startLevel zodat HTML-knoppen het kunnen oproepen
  window.startLevel = startLevel;
})();
