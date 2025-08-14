// /volwassenmodus/common/layout.js

// 1) Volwassenenbescherming — blijft ingelogd tot handmatig uitloggen
if (!localStorage.getItem("ingelogdeParochie") || localStorage.getItem("modus") !== "volwassene") {
  window.location.href = "https://kathy-torfs.github.io/Orthodoxeweg/index.html";
}

// 2) Header injecteren
(async () => {
  try {
    const resp = await fetch("https://kathy-torfs.github.io/Orthodoxeweg/volwassenmodus/common/header.html", { cache: "no-store" });
    const html = await resp.text();

    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    document.body.prepend(wrapper);

    // 3) Begroeting
    const welkomEl = document.getElementById("welkom-tekst");
    const loginNaam = localStorage.getItem("loginKeuze") || "gebruiker";
    const parochieNaam = localStorage.getItem("ingelogdeParochieNaam") || "(onbekend)";
    if (welkomEl) welkomEl.textContent = `Welkom, ${loginNaam}! U bent ingelogd in de ${parochieNaam}.`;

    // 4) Avatar
    const avatarImg = document.getElementById("menu-avatar-img");
    const opgeslagenAvatar = localStorage.getItem("avatarURL");
    if (avatarImg && opgeslagenAvatar) avatarImg.src = opgeslagenAvatar;

    // 5) Uitloggen (handmatig)
    const uitlogKnop = document.getElementById("uitlogKnop");
    if (uitlogKnop) {
      uitlogKnop.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "https://kathy-torfs.github.io/Orthodoxeweg/index.html";
      });
    }

    // 6) Persistente sessie marker (optioneel)
    localStorage.setItem("sessie_persistent", "true");
  } catch (e) {
    console.error("Header laden mislukt:", e);
  }
})();
