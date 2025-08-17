// springspel.js

const photeinos = document.getElementById("photeinos");
const gameContainer = document.getElementById("gameContainer");
const questionBox = document.getElementById("questionBox");
const questionText = document.getElementById("questionText");
const answersDiv = document.getElementById("answers");

let posX = 50;
let posY = 0;
let velocityY = 0;
let jumping = false;
let score = 0;
let level = 1;

const gravity = 2;
const ground = 0;

// Obstakels (emoji)
const obstacleIcons = ["🪨","🔥","🐍"];
// Collectibles (emoji)
const collectibleIcons = ["🕊️","⭐","✨"];

function loadLevel(lvl) {
  gameContainer.style.backgroundImage = `url('https://kathy-torfs.github.io/Orthodoxeweg/images/level${lvl}.png')`;
  gameContainer.querySelectorAll(".obstacle, .collectible").forEach(e => e.remove());

  // Obstakels
  obstacleIcons.forEach((icon, idx) => {
    const obs = document.createElement("div");
    obs.className = "obstacle";
    obs.style.left = (400 + idx*400) + "px";
    obs.textContent = icon;
    gameContainer.appendChild(obs);
  });

  // Collectibles
  collectibleIcons.forEach((icon, idx) => {
    const col = document.createElement("div");
    col.className = "collectible";
    col.style.left = (600 + idx*400) + "px";
    col.style.top = (150 + idx*50) + "px";
    col.textContent = icon;
    gameContainer.appendChild(col);
  });
}

// Botsingscontrole
function checkCollision(a, b) {
  const rect1 = a.getBoundingClientRect();
  const rect2 = b.getBoundingClientRect();
  return !(rect1.top > rect2.bottom ||
           rect1.bottom < rect2.top ||
           rect1.right < rect2.left ||
           rect1.left > rect2.right);
}

// Vraag stellen
function showQuestion(vraag) {
  questionBox.style.display = "block";
  questionText.textContent = vraag.q;
  answersDiv.innerHTML = "";

  vraag.a.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => {
      questionBox.style.display = "none";
      if (idx === vraag.correct) {
        score++;
        if (score >= 10) {
          level++;
          score = 0;
          if (level > 5) {
            alert("🎉 Proficiat! Je hebt het spel uitgespeeld!");
            location.reload();
          } else {
            loadLevel(level);
            alert("Level " + level + " gestart!");
          }
        }
      } else {
        alert("Fout antwoord – probeer opnieuw!");
        location.reload();
      }
    };
    answersDiv.appendChild(btn);
  });
}

function askQuestion(type) {
  let pool;
  if (type === "zonde") {
    pool = vragen.filter(v => v.difficulty === "zonde");
  } else {
    if (level <= 3) pool = vragen.filter(v => v.difficulty === "1");
    if (level === 4) pool = vragen.filter(v => v.difficulty === "2");
    if (level === 5) pool = vragen.filter(v => v.difficulty === "3");
  }
  const vraag = pool[Math.floor(Math.random()*pool.length)];
  showQuestion(vraag);
}

// Controls
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") posX += 20;
  if (e.key === "ArrowLeft") posX -= 20;
  if (e.key === " " && !jumping) {
    velocityY = 25;
    jumping = true;
  }
  photeinos.style.left = posX + "px";
});

function gameLoop() {
  // Gravity
  if (jumping) {
    posY += velocityY;
    velocityY -= gravity;
    if (posY <= ground) {
      posY = ground;
      jumping = false;
    }
    photeinos.style.bottom = posY + "px";
  }

  // Botsing obstakels
  document.querySelectorAll(".obstacle").forEach(obs => {
    if (checkCollision(photeinos, obs)) {
      askQuestion("zonde");
    }
  });

  // Botsing collectibles
  document.querySelectorAll(".collectible").forEach(col => {
    if (checkCollision(photeinos, col) && col.style.display !== "none") {
      col.style.display = "none";
      askQuestion("licht");
    }
  });

  requestAnimationFrame(gameLoop);
}

// Start
loadLevel(level);
gameLoop();
