// -----------------------------
// Variabelen voor band
// -----------------------------
let bandX = 0;
const bandSpeed = 3;
const bandHeight = 100;
const bandY = canvas.height - bandHeight - 50; // bv. 50px boven de grond

// -----------------------------
// Update loop
// -----------------------------
function update() {
  if (!running || paused) return;

  updatePlayer();

  // Band laten schuiven
  bandX -= bandSpeed;
  if (bandX <= -canvas.width) bandX = 0;

  // Collectables mee bewegen
  collectables.forEach(c => c.x -= bandSpeed);
  collectables = collectables.filter(c => c.x + c.w > 0);

  // Botsing met collectables
  for (let i = collectables.length - 1; i >= 0; i--) {
    const c = collectables[i];
    if (rectsOverlap(photeinos, c)) {
      score++;
      collectables.splice(i, 1);
      alert("Vraag uit vragen.js!"); // hier vragen.js logica
    }
  }
}

// -----------------------------
// Draw loop
// -----------------------------
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Achtergrond vast
  ctx.drawImage(levelBackgrounds[currentLevel], 0, 0, canvas.width, canvas.height);

  // Band tekenen (transparante rechthoek die scrollt)
  ctx.fillStyle = "rgba(200,200,200,0.2)";
  ctx.fillRect(bandX, bandY, canvas.width, bandHeight);
  ctx.fillRect(bandX + canvas.width, bandY, canvas.width, bandHeight);

  // Collectables op de band
  collectables.forEach(c => ctx.drawImage(c.img, c.x, bandY + 10, c.w, c.h));

  // Speler
  ctx.drawImage(photeinosImg, photeinos.x, photeinos.y, photeinos.w, photeinos.h);

  // Obstakels (blijven vast op de grond)
  ctx.fillStyle = "brown";
  obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));

  // Score
  ctx.fillStyle = "black";
  ctx.font = "20px Comic Sans MS";
  ctx.fillText("Score: " + score, 20, 30);
}
