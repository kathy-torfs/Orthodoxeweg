(function () {
  const CONFIG = {
    headerDefaultMountId: "priester-header",
    headerDefaultSrc: "common/header.html"
  };

  function ensureLoggedInOrRedirect() {
    if (!localStorage.getItem("ingelogdeParochie") || localStorage.getItem("modus") !== "priester") {
      window.location.href = "https://kathy-torfs.github.io/Orthodoxeweg/index.html";
      return false;
    }
    return true;
  }

  function setGreeting() {
    const el = document.getElementById("welkom-tekst");
    if (!el) return;

    const uur = new Date().getHours();
    let moment = "goeiedag";
    if (uur >= 5 && uur <= 10) moment = "goeiemorgen";
    else if (uur >= 11 && uur <= 13) moment = "goeiemiddag";
    else if (uur >= 17 && uur <= 22) moment = "goeienavond";
    else if (uur > 22 || uur < 5) moment = "goedenacht";

    const parochie = localStorage.getItem("ingelogdeParochie") || "(onbekend)";
    el.textContent = `${moment} vader, ik wens u een gezegende dag. U bent ingelogd in: ${parochie}`;
  }

  function bindLogout() {
    const btn = document.getElementById("uitlogKnop");
    if (!btn) return;
    btn.addEventListener("click", () => {
      localStorage.removeItem("ingelogdeParochie");
      localStorage.removeItem("ingelogdeParochieId");
      localStorage.removeItem("modus");
      window.location.href = "https://kathy-torfs.github.io/Orthodoxeweg/index.html";
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
