// common/layout.js  — Kinderlayout: header laden + beveiliging + punten live
(function () {
  const HEADER_MOUNT_ID = "kid-header";        // <div id="kid-header"></div> op elke pagina
  const HEADER_PATH = "common/header.html";    // pad naar de header (relatief t.o.v. pagina)

  // ---- Pastel-achtergrond bij laden ----
  (function setRandomPastel() {
    const pastel = [
      "var(--pastel1)", "var(--pastel2)", "var(--pastel3)", "var(--pastel4)",
      "var(--pastel5)", "var(--pastel6)", "var(--pastel7)", "var(--pastel8)",
      "var(--pastel9)", "var(--pastel10)", "var(--pastel11)", "var(--pastel12)",
      "var(--pastel13)", "var(--pastel14)", "var(--pastel15)", "var(--pastel16)"
    ];
    const i = Math.floor(Math.random() * pastel.length);
    document.documentElement.style.setProperty("--page-bg", pastel[i]);
    if (!document.body.style.background) document.body.style.background = pastel[i];
  })();

  // ---- Beveiliging: kind moet ingelogd zijn ----
  function ensureKidLoggedIn() {
    const kindIngelogd = localStorage.getItem("kindIngelogd");
    const kindId = localStorage.getItem("ingelogdKindId");
    const parochieId = localStorage.getItem("ingelogdeParochie");
    const ouderLogin = localStorage.getItem("loginKeuze");
    if (kindIngelogd !== "true" || !kindId || !parochieId || !ouderLogin) {
      // terug naar volwassen login
      window.location.href = "https://kathy-torfs.github.io/Orthodoxeweg/volwassenmodus/parochie.html";
      return false;
    }
    return true;
  }

  // ---- Firebase init (compat) ----
  function initFirebaseOnce() {
    if (window.firebase && firebase.apps && firebase.apps.length) return;

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
      // na init kun je header vullen (als nog niet gebeurd)
      if (!document.getElementById(HEADER_MOUNT_ID)?.dataset.headerLoaded) {
        loadHeader();
      } else {
        // header staat er al → nog wel init van greeting + punten
        afterHeaderMounted();
      }
    };

    // als app-compat geladen is, laad firestore-compat
    s1.onload = () => document.head.appendChild(s2);
    document.head.appendChild(s1);
  }

  // ---- Header laden en mounten ----
  async function loadHeader() {
    if (!ensureKidLoggedIn()) return;

    const mount = document.getElementById(HEADER_MOUNT_ID);
    if (!mount) {
      console.warn(`[layout.js] Plaats <div id="${HEADER_MOUNT_ID}"></div> in je pagina.`);
      return;
    }

    try {
      const res = await fetch(HEADER_PATH, { cache: "no-cache" });
      const html = await res.text();
      mount.innerHTML = html;
      mount.dataset.headerLoaded = "1";
      afterHeaderMounted();
    } catch (e) {
      console.error("[layout.js] Header laden mislukt:", e);
    }
  }

  // ---- Na het mounten van de header: greeting, uitloggen, punten live, etc. ----
  function afterHeaderMounted() {
    // Begroeting
    const kindNaam = localStorage.getItem("ingelogdKindVoornaam") || "Kind";
    const groetTekstEl = document.getElementById("groet-tekst");
    if (groetTekstEl) {
      const h = new Date().getHours();
      const groet = (h >= 6 && h <= 11) ? "Goeiemorgen"
                  : (h >= 12 && h <= 16) ? "Goeiemiddag"
                  : (h >= 17 && h <= 22) ? "Goeieavond" : "Hallo";
      groetTekstEl.textContent = `${groet}, ${kindNaam}!`;
    }

    // Uitloggen globally
    window.uitloggenKind = function () {
      localStorage.removeItem("kindIngelogd");
      localStorage.removeItem("ingelogdKindId");
      localStorage.removeItem("ingelogdKindVoornaam");
      localStorage.removeItem("kindAvatarURL");
      localStorage.removeItem("kindPunten");
      window.location.href = "https://kathy-torfs.github.io/Orthodoxeweg/volwassenmodus/parochie.html";
    };

    // Live punten teller
    setupLivePoints();
  }

  // ---- Live punten (Firestore onSnapshot) ----
  function setupLivePoints() {
    if (!window.firebase || !firebase.firestore) return;

    const db = firebase.firestore();
    const parochieId = localStorage.getItem("ingelogdeParochie");
    const ouderLogin = localStorage.getItem("loginKeuze");
    const kindId = localStorage.getItem("ingelogdKindId");
    const tellerEl = document.getElementById("punten-teller");

    if (!tellerEl || !parochieId || !ouderLogin || !kindId) return;

    const ref = db.collection("parochies").doc(parochieId)
      .collection("leden").doc(ouderLogin)
      .collection("kinderen").doc(kindId);

    ref.onSnapshot((snap) => {
      const punten = snap.exists ? (snap.data().punten || 0) : 0;
      tellerEl.textContent = punten;
      tellerEl.style.transform = "scale(1.18)";
      setTimeout(() => (tellerEl.style.transform = "scale(1)"), 160);
    }, (err) => {
      console.warn("Kan punten niet live lezen:", err);
      tellerEl.textContent = "…";
    });
  }

  // ---- Auto‑start ----
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (!ensureKidLoggedIn()) return;
      initFirebaseOnce();
      // header wordt geladen zodra Firebase klaar is (zie initFirebaseOnce)
    });
  } else {
    if (!ensureKidLoggedIn()) return;
    initFirebaseOnce();
  }
})();
