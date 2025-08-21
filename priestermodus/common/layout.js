(function () {
  const CONFIG = {
    headerDefaultMountId: "priester-header",
    headerDefaultSrc: "common/header.html"
  };

  // ---------- Utils ----------
  function isPriestLoggedIn() {
    const flag = (localStorage.getItem("priesterIngelogd") || "").toLowerCase();
    return flag === "true" || flag === "ja" || flag === "1";
  }

  function ensureLoggedInOrRedirect() {
    if (!isPriestLoggedIn()) {
      window.location.replace("https://kathy-torfs.github.io/Orthodoxeweg/index.html");
      return false;
    }
    return true;
  }

  function setGreeting() {
    const el = document.getElementById("groet-tekst");
    if (!el) return;
    const naam = localStorage.getItem("ingelogdePriesterNaam") || "vader";

    const uur = new Date().getHours();
    let moment = "goeiedag";
    if (uur >= 5 && uur <= 10) moment = "goeiemorgen";
    else if (uur >= 11 && uur <= 13) moment = "goeiemiddag";
    else if (uur >= 17 && uur <= 22) moment = "goeienavond";
    else if (uur > 22 || uur < 5) moment = "goedenacht";

    el.textContent = `${moment}, ${naam}!`;
  }

  function bindLogout() {
    const btn = document.getElementById("uitlogBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      localStorage.removeItem("priesterIngelogd");
      localStorage.removeItem("ingelogdePriesterNaam");
      window.location.replace("https://kathy-torfs.github.io/Orthodoxeweg/index.html");
    });
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

    setGreeting();
    bindLogout();
  }

  window.PriesterLayout = { mountHeader };

  // Auto-mount als container aanwezig is
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
