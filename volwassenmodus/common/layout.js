// /volwassenmodus/common/layout.js

// 0) Volwassenenbescherming — blijft ingelogd tot handmatig uitloggen
try {
  if (!localStorage.getItem("ingelogdeParochie") || localStorage.getItem("modus") !== "volwassene") {
    window.location.href = "https://kathy-torfs.github.io/Orthodoxeweg/index.html";
  }
} catch (e) {
  console.warn("Kon localStorage niet lezen voor modus-check:", e);
}

// 1) Probeerpaden voor header.html
const CANDIDATES = [
  "https://kathy-torfs.github.io/Orthodoxeweg/volwassenmodus/common/header.html",
  "/Orthodoxeweg/volwassenmodus/common/header.html",
  "../common/header.html",
  "./common/header.html",
  "common/header.html"
];

// 2) Fallback header
const FALLBACK_HEADER = `
<div id="ow-topbar-and-menu">
  <style>
    :root{ --bg:#f5e9b8; --text:#6f4e1a; --bar:#6f4e1a; --menu:#7a5f35; --menu-hover:#5d4726; --chip:#f5e9b8; --accent:#8722aa; --ring:#dab97a; }
    *{box-sizing:border-box}
    .topbar{background-color:var(--bar); color:#fff; padding:12px 20px; display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;}
    #welkom-tekst{font-size:1.05em; font-weight:normal}
    .uitlog-link{background-color:var(--accent); color:#fff; border:none; padding:8px 18px; border-radius:18px; cursor:pointer; font-weight:bold;}

    nav.menu{background-color:var(--menu); padding:10px 14px; display:flex; flex-direction:column; gap:6px; align-items:center;}
    .menu-row{display:flex; flex-wrap:wrap; justify-content:center; gap:10px;}
    .menu-item{display:inline-flex; align-items:center; gap:8px; text-decoration:none; color:var(--chip); font-weight:600; font-size:15px; line-height:1; padding:8px 10px; border-radius:10px; transition:background-color .2s ease, transform .05s ease;}
    .menu-item:hover{background-color:var(--menu-hover); text-decoration:none}
    .menu-item:active{transform:translateY(1px)}
    .ico{width:18px; height:18px; display:inline-block; flex:0 0 18px; stroke:currentColor; fill:none; stroke-width:2}
    .label{white-space:nowrap}
    .menu-avatar{padding:0!important; background:none!important; border:none!important; margin-left:2px; display:inline-flex; align-items:center}
    .menu-avatar img{height:2.05em; width:2.05em; border-radius:50%; border:2.2px solid var(--ring); background:#fff8eb; transition:box-shadow .2s, border .2s; box-shadow:0 1px 4px rgba(160,140,80,0.13); display:block;}
    .menu-avatar img:hover{border:2.2px solid #a06a19; box-shadow:0 2px 8px rgba(160,140,80,0.23)}
    @media (max-width:650px){ .menu-item{font-size:14px; padding:7px 9px; gap:7px} .ico{width:17px; height:17px} .menu-avatar img{height:1.8em; width:1.8em} .label{display:none} }
  </style>

  <!-- TOPBAR -->
  <div class="topbar">
    <div id="welkom-tekst"></div>
    <button class="uitlog-link" id="uitlogKnop">🚪 Uitloggen</button>
  </div>

  <!-- MENUBALK — Rij 1 -->
  <nav class="menu" aria-label="Hoofdmenu">
    <div class="menu-row">
      <a class="menu-item" href="https://kathy-torfs.github.io/Orthodoxeweg/volwassenmodus/parochie.html">🛐 <span class="label">Mijn parochie</span></a>
      <a class="menu-item" href="https://kathy-torfs.github.io/Orthodoxeweg/volwassenmodus/ikbid.html">🙏 <span class="label">Ik bid</span></a>
      <a class="menu-item" href="https://kathy-torfs.github.io/Orthodoxeweg/volwassenmodus/bijbeldagboek.html">📔 <span class="label">Bijbeldagboek</span></a>
      <a class="menu-item" href="https://kathy-torfs.github.io/Orthodoxeweg/volwassenmodus/kookboek.html">🍲 <span class="label">Kookboek</span></a>
      <a class="menu-item" href="https://kathy-torfs.github.io/Orthodoxeweg/volwassenmodus/verjaardagskalender.html">🎂 <span class="label">Verjaardagskalender</span></a>
      <a class="menu-item" href="https://kathy-torfs.github.io/Orthodoxeweg/volwassenmodus/orthodoxe_tuin.html" title="Orthodoxe Tuin">🌻🌻🌻 <span class="label">Tuin</span></a>
      <a class="menu-item menu-avatar" href="https://kathy-torfs.github.io/Orthodoxeweg/volwassenmodus/profiel.html" title="Mijn profiel">
        <img id="menu-avatar-img" src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png" alt="Mijn profiel">
        <span class="label">Profiel</span>
      </a>
    </div>
  </nav>
</div>
`;

// 3) Header laden (fetch) of fallback gebruiken
(async () => {
  let html = null;
  for (const url of CANDIDATES) {
    try {
      const resp = await fetch(url, { cache: "no-store" });
      if (resp.ok) {
        html = await resp.text();
        console.info("[layout] header geladen van:", url);
        break;
      }
    } catch (e) {
      console.warn("[layout] header fetch mislukt:", url, e);
    }
  }
  if (!html) {
    console.error("[layout] header niet gevonden via fetch — gebruik FALLBACK_HEADER");
    html = FALLBACK_HEADER;
  }

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  document.body.prepend(wrapper);

  // Begroeting
  try {
    const welkomEl = document.getElementById("welkom-tekst");
    const loginNaam = localStorage.getItem("loginKeuze") || "gebruiker";
    const parochieNaam =
      localStorage.getItem("ingelogdeParochieNaam") ||
      localStorage.getItem("ingelogdeParochie") ||
      "(onbekend)";
    if (welkomEl) welkomEl.textContent = `Welkom, ${loginNaam}! U bent ingelogd in de ${parochieNaam}.`;
  } catch (e) {
    console.warn("Kon begroeting niet zetten:", e);
  }

  // Avatar
  try {
    const avatarImg = document.getElementById("menu-avatar-img");
    const opgeslagenAvatar = localStorage.getItem("avatarURL");
    if (avatarImg && opgeslagenAvatar) avatarImg.src = opgeslagenAvatar;
  } catch (e) {
    console.warn("Kon avatar niet zetten:", e);
  }

  // Uitloggen
  const uitlogKnop = document.getElementById("uitlogKnop");
  if (uitlogKnop) {
    uitlogKnop.addEventListener("click", () => {
      try { localStorage.clear(); } catch {}
      window.location.href = "https://kathy-torfs.github.io/Orthodoxeweg/index.html";
    });
  }

  try { localStorage.setItem("sessie_persistent", "true"); } catch {}
})();
