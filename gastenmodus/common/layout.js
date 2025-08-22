// gastenmodus layout.js
(function () {
  const CONFIG = {
    headerDefaultMountId: "gasten-header",
    headerDefaultSrc: "common/header.html"
  };

function setGreeting() {
    const el = document.getElementById("welkom-tekst");
    if (!el) return;

    const uur = new Date().getHours();
    let moment = "Welkom";
    if (uur >= 5 && uur <= 10) moment = "Goeiemorgen en welkom op Orthodoxe Weg!";
    else if (uur >= 11 && uur <= 13) moment = "Goeiemiddag en welkom op Orthodoxe Weg!";
    else if (uur >= 17 && uur <= 22) moment = "Goeienavond en welkom op Orthodoxe Weg!";
    else if (uur > 22 || uur < 5) moment = "Goedenacht en welkom op Orthodoxe Weg!";
    else moment = "Welkom op Orthodoxe Weg!";

    el.textContent = moment;
  }

  async function mountHeader({ rootId, headerSrc } = {}) {
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
  }

  window.GastenLayout = { mountHeader };

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
