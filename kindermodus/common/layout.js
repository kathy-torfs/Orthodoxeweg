(function () {
  const HEADER_MOUNT_ID = "kid-header";
  // Absolute URL naar header.html
  const HEADER_PATH = "https://kathy-torfs.github.io/Orthodoxeweg/kindermodus/common/header.html";

  function isTrue(val) {
    if (val == null) return false;
    const v = String(val).toLowerCase();
    return v === "true" || v === "ja" || v === "1" || v === "yes";
  }

  // ---- Beveiliging: kind moet ingelogd zijn ----
  function ensureKidLoggedIn() {
    const flag = localStorage.getItem("kindIngelogd") ?? localStorage.getItem("kind_ingelogd");
    const ok = isTrue(flag);

    const kindId = localStorage.getItem("ingelogdKindId");
    const parochieId = localStorage.getItem("ingelogdeParochie");
    const ouderLogin = localStorage.getItem("loginKeuze");

    // Nog niet als kind ingelogd → naar kind-inlog
    if (!ok || !kindId) {
      window.location.href = "https://kathy-torfs.github.io/Orthodoxeweg/kindermodus/inloggen.html";
      return false;
    }
    // Geen ouder/parochie context → naar ouder-login
    if (!parochieId || !ouderLogin) {
      window.location.href = "https://kathy-torfs.github.io/Orthodoxeweg/volwassenmodus/parochie.html";
      return false;
    }
    return true;
  }

  // ---- Firebase initialiseren ----
  function initFirebaseOnce() {
    if (window.firebase && firebase.apps && firebase.apps.length) {
      if (!document.getElementById(HEADER_MOUNT_ID)?.dataset.headerLoaded) loadHeader();
      else afterHeaderMounted();
      return;
    }
    const s1 = document.createElement("script");
    s1.src = "https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js";
    const s2 = document.createElement("script");
    s2.src = "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore-compat.js";
    s2.onload = () => {
      if (!firebase.apps.length) {
        firebase.initializeApp({
          apiKey: "AIzaSyBG1iQBmruHUZI1OeW8RgbJ_TPit_7a2LQ",
          authDomain: "orthodoxeweg.firebaseapp.com",
          projectId: "orthodoxeweg",
          storageBucket: "orthodoxeweg.appspot.com",
          messagingSenderId: "408582263618",
          appId: "1:408582263618:web:0a20f4bf0704989d3ceedb"
        });
      }
      if (!document.getElementById(HEADER_MOUNT_ID)?.dataset.headerLoaded) loadHeader();
      else afterHeaderMounted();
    };
    s1.onload = () => document.head.appendChild(s2);
    document.head.appendChild(s1);
  }

  async function loadHeader() {
    if (!ensureKidLoggedIn()) return;
    const mount = document.getElementById(HEADER_MOUNT_ID);
    if (!mount) { console.warn(`[layout.js] Plaats <div id="${HEADER_MOUNT_ID}"></div> in je pagina.`); return; }
    try {
      const res = await fetch(HEADER_PATH, { cache: "no-cache" });
      mount.innerHTML = await res.text();
      mount.dataset.headerLoaded = "1";
      afterHeaderMounted();
    } catch (e) { console.error("[layout.js] Header laden mislukt:", e); }
  }

  function afterHeaderMounted() {
    const kindNaam = localStorage.getItem("ingelogdKindVoornaam") || "Kind";
    const h = new Date().getHours();
    const groet = (h >= 6 && h <= 11) ? "Goeiemorgen" :
                  (h >= 12 && h <= 16) ? "Goeiemiddag" :
                  (h >= 17 && h <= 22) ? "Goeieavond" : "Hallo";
    const groetEl = document.getElementById("groet-tekst");
    if (groetEl) groetEl.textContent = `${groet}, ${kindNaam}!`;

    window.uitloggenKind = function () {
      localStorage.removeItem("kindIngelogd");
      localStorage.removeItem("kind_ingelogd");
      localStorage.removeItem("ingelogdKindId");
      localStorage.removeItem("ingelogdKindVoornaam");
      localStorage.removeItem("kindAvatarURL");
      localStorage.removeItem("kindPunten");
      window.location.href = "https://kathy-torfs.github.io/Orthodoxeweg/kindermodus/inloggen.html";
    };

    setupLivePoints();
  }

  function setupLivePoints() {
    if (!(window.firebase && firebase.firestore)) return;
    const db = firebase.firestore();
    const parochieId = localStorage.getItem("ingelogdeParochie");
    const ouderLogin = localStorage.getItem("loginKeuze");
    const kindId = localStorage.getItem("ingelogdKindId");
    const el = document.getElementById("punten-teller");
    if (!el || !parochieId || !ouderLogin || !kindId) return;

    db.collection("parochies").doc(parochieId)
      .collection("leden").doc(ouderLogin)
      .collection("kinderen").doc(kindId)
      .onSnapshot(snap => {
        const p = snap.exists ? (snap.data().punten || 0) : 0;
        el.textContent = p;
        el.style.transform = "scale(1.18)";
        setTimeout(() => el.style.transform = "scale(1)", 160);
      }, err => {
        console.warn("Kan punten niet live lezen:", err);
        el.textContent = "…";
      });
  }

  // Start
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { if (!ensureKidLoggedIn()) return; initFirebaseOnce(); });
  } else {
    if (!ensureKidLoggedIn()) return; initFirebaseOnce();
  }
})();
