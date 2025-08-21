document.addEventListener("DOMContentLoaded", () => {
  // 🔒 beveiliging
  if (localStorage.getItem("modus") !== "priester" || !localStorage.getItem("ingelogdeParochie")) {
    window.location.href = "https://kathy-torfs.github.io/Orthodoxeweg/index.html";
    return;
  }

  // 🕑 begroeting
  const uur = new Date().getHours();
  let moment = "goeiedag";
  if (uur >= 5 && uur <= 10) moment = "goeiemorgen";
  else if (uur >= 11 && uur <= 13) moment = "goeiemiddag";
  else if (uur >= 17 && uur <= 22) moment = "goeienavond";
  else if (uur > 22 || uur < 5) moment = "goedenacht";

  const parochie = localStorage.getItem("ingelogdeParochie") || "(onbekend)";
  document.getElementById("groet-tekst").textContent =
    `${moment}, vader! U bent ingelogd in: ${parochie}`;

  // 🚪 uitloggen
  document.getElementById("uitlogBtn").addEventListener("click", () => {
    localStorage.removeItem("modus");
    localStorage.removeItem("ingelogdeParochie");
    window.location.href = "https://kathy-torfs.github.io/Orthodoxeweg/index.html";
  });
});
