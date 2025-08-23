// Volwassenmodus layout.js 
(function () {
  const CONFIG = {
    headerDefaultMountId: "volwassen-header",
    headerDefaultSrc: "common/header.html",
    loginUrl: "https://kathy-torfs.github.io/Orthodoxeweg/index.html"
  };

  function ensureLoggedInOrRedirect() {
    if (!localStorage.getItem("ingelogdeParochie") || localStorage.getItem("modus") !== "volwassene") {
      window.location.href = CONFIG.loginUrl;
      return false;
    }
    return true;
  }

  function setWelcome() {
    const el = document.getElementById("welkom-tekst");
    if (!el) return;

    const naam = localStorage.getItem("ingelogdeVolwasseneNaam")
              || localStorage.getItem("loginKeuze")
              || "bezoeker";

    const uur  = new Date().getHours();
    let moment = "goeiedag";
    if (uur >= 5 && uur <= 10) moment = "goeiemorgen";
    else if (uur >= 11 && uur <= 13) moment = "goeiemiddag";
    else if (uur >= 17 && uur <= 22) moment = "goeienavond";
    else if (uur > 22 || uur < 5) moment = "goedenacht";

    const parochie = localStorage.getItem("ingelogdeParochieNaam") 
                  || localStorage.getItem("ingelogdeParochie") 
                  || "(onbekend)";

    el.textContent = `${moment}, ${naam}. Je bent ingelogd in: ${parochie}`;
  }

  function setAvatar() {
    const img = document.getElementById("menu-avatar-img");
    if (img) {
      const url = localStorage.getItem("avatarURL");
      if (url) img.src = url;
    }
  }

  function bindLogout() {
    const btn = document.getElementById("uitlogKnop");
    if (!btn) return;
    btn.addEventListener("click", () => {
      localStorage.removeItem("ingelogdeParochie");
      localStorage.removeItem("ingelogdeParochieId");
      localStorage.removeItem("ingelogdeVolwasseneNaam");
      localStorage.removeItem("loginKeuze");
      localStorage.removeItem("avatarURL");
      localStorage.removeItem("modus");
      localStorage.removeItem("rol");
      window.location.href = CONFIG.loginUrl;
    });
  }

  function voegCatecheetKnopToe() {
    const rol = localStorage.getItem("rol");
    if (rol !== "catecheet") return;

    const menuRows = document.querySelectorAll("nav.menu .menu-row");
    if (!menuRows.length) return;

    const tweedeRij = menuRows[1];
    if (!tweedeRij) return;

    if (document.getElementById("catecheet-menu-item")) return;

    const a = document.createElement("a");
    a.className = "menu-item";
    a.id = "catecheet-menu-item";
    a.href = "https://kathy-torfs.github.io/Orthodoxeweg/volwassenmodus/mijnklasje.html";
    a.innerHTML = "👩‍🏫 <span class=\"label\">Mijn klasje</span>";

    tweedeRij.insertBefore(a, tweedeRij.firstChild);
  }

  async function mountHeader({ rootId, headerSrc } = {}) {
    if (!ensureLoggedInOrRedirect()) return;

    const mountId = rootId || CONFIG.headerDefaultMountId;
    const src     = headerSrc || CONFIG.headerDefaultSrc;
    const mountEl = document.getElementById(mountId);
    if (!mountEl) {
      console.warn(`[layout] Plaats <div id="${CONFIG.headerDefaultMountId}"></div> in je pagina.`);
      return;
    }

    try {
      const html = await fetch(src, { cache: "no-cache" }).then(r => r.text());
      mountEl.innerHTML = html;
    } catch (e) {
      console.error("[layout] Header laden mislukt:", e);
      return;
    }

    setWelcome();
    setAvatar();
    bindLogout();
    voegCatecheetKnopToe(); // <-- catecheet menu toevoegen
  }

  window.VolwassenLayout = { mountHeader };

  function autoMountIfPresent() {
    const el = document.getElementById(CONFIG.headerDefaultMountId);
    if (!el) return;
    const src = el.getAttribute("data-header-src") || CONFIG.headerDefaultSrc;
    mountHeader({ rootId: CONFIG.headerDefaultMountId, headerSrc: src });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoMountIfPresent);
  } else {
    autoMountIfPresent();
  }
})();
