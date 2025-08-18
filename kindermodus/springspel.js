// ---- Speler (Photeinos) ----
const photeinosImg = new Image();
photeinosImg.src = "images/photeinos_walk.png";

const photeinos = {
  x: 50, y: 0, w: 60, h: 60,
  vy: 0, onGround: false
};

// ---- Update speler ----
function updatePlayer() {
  if (keys["ArrowRight"]) photeinos.x += speed;
  if (keys["ArrowLeft"]) photeinos.x -= speed;
  if (keys["Space"] && photeinos.onGround) {
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

// ---- Teken speler ----
function drawPlayer() {
  ctx.drawImage(photeinosImg, photeinos.x, photeinos.y, photeinos.w, photeinos.h);
}
