// common/layout.js
(function () {
  const CONFIG = {
    headerDefaultMountId: "kinder-header",
    headerDefaultSrc: "common/header.html",
    loginUrl: "https://kathy-torfs.github.io/Orthodoxeweg/kindermodus/inlog.html",
    firebase: {
      apiKey: "AIzaSyBG1iQBmruHUZI1OeW8RgbJ_TPit_7a2LQ",
      authDomain: "orthodoxeweg.firebaseapp.com",
      projectId: "orthodoxeweg",
      storageBucket: "orthodoxeweg.appspot.com",
      messagingSenderId: "408582263618",
      appId: "1:408582263618:web:0a20f4bf0704989d3ceedb"
    }
  };
  
  let pointsUnsub = null;

  function isKidLoggedIn() {
    const flags = [
      localStorage.getItem("kindIngelogd"),
      localStorage.getItem("kind_ingelogd")
    ].map(v => (v || "").toLowerCase());

    const logged = flags.includes("true") || flags.includes("ja") || flags.includes("1");
    const mustHave = localStorage.getItem("ingelogdKindId") &&
                     localStorage.getItem("ingelogdeParochie") &&
                     localStorage.getItem("loginKeuze");

    return logged && !!mustHave;
  }

  function ensureLoggedInOrRedirect() {
    if (!isKidLoggedIn()) {
      window.location.replace(CONFIG.loginUrl);
      return false;
    }
    return true;
  }

  function loadFirebaseCompatIfNeeded() {
    return new Promise(resolve => {
      if (window.firebase && firebase.apps && firebase.apps.length) {
        resolve();
        return;
      }
      const add = (src, onload) => {
        const s = document.createElement("script");
        s.src = src; s.onload = onload; s.defer = true;
        document.head.appendChild(s);
      };
      add("https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js", () => {
        add("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore-compat.js", () => {
          if (!firebase.apps.length) firebase.initializeApp(CONFIG.firebase);
          resolve();
        });
      });
    });
  }

  function setGreeting() {
    const el = document.getElementById("groet-tekst");
    if (!el) return;
    const naam = localStorage.getItem("ingelogdKindVoornaam") || "kind";
    const h = new Date().getHours();
    const groet = (h >= 6 && h <= 11) ? "Goeiemorgen"
               : (h >= 12 && h <= 16) ? "Goeiemiddag"
               : (h >= 17 && h <= 22) ? "Goeieavond" : "Hallo";
    el.textContent = `${groet}, ${naam}!`;
  }

  function bindLogout() {
    const btn = document.getElementById("uitlogBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      localStorage.removeItem("kindIngelogd");
      localStorage.removeItem("kind_ingelogd");
      localStorage.removeItem("ingelogdKindId");
      localStorage.removeItem("ingelogdKindVoornaam");
      localStorage.removeItem("kindAvatarURL");
      localStorage.removeItem("kindPunten");
      window.location.replace("https://kathy-torfs.github.io/Orthodoxeweg/volwassenmodus/parochie.html");
    });
  }

  function startLivePoints() {
    stopLivePoints();
    const teller = document.getElementById("punten-teller");
    if (!teller) return;

    const parochieId = localStorage.getItem("ingelogdeParochie");
    const ouderLogin = localStorage.getItem("loginKeuze");
    const kindId     = localStorage.getItem("ingelogdKindId");
    if (!parochieId || !ouderLogin || !kindId) {
      teller.textContent = "…";
      return;
    }
    const db = firebase.firestore();
    const ref = db.collection("parochies").doc(parochieId)
      .collection("leden").doc(ouderLogin)
      .collection("kinderen").doc(kindId);

    pointsUnsub = ref.onSnapshot(
      snap => {
        const punten = snap.exists ? (snap.data().punten || 0) : 0;
        teller.textContent = punten;
        teller.style.transform = "scale(1.18)";
        setTimeout(() => (teller.style.transform = "scale(1)"), 160);
      },
      err => {
        console.warn("Punten live lezen mislukt:", err);
        teller.textContent = "…";
      }
    );
  }

  function stopLivePoints() {
    if (typeof pointsUnsub === "function") {
      pointsUnsub();
      pointsUnsub = null;
    }
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

    await loadFirebaseCompatIfNeeded();

    try {
      const html = await fetch(src, { cache: "no-cache" }).then(r => r.text());
      mountEl.innerHTML = html;
    } catch (e) {
      console.error("[layout] Header laden mislukt:", e);
      return;
    }

    setGreeting();
    bindLogout();
    startLivePoints();
  }

  window.KinderLayout = {
    mountHeader,
    refreshPoints: startLivePoints
  };

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

  window.addEventListener("beforeunload", stopLivePoints);
})();
