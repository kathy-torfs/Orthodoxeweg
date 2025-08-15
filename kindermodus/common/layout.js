// common/layout.js
(function(){
  const HEADER_MOUNT_ID = "kid-header";
  const HEADER_URL = "https://kathy-torfs.github.io/Orthodoxeweg/kindermodus/common/header.html";

  // 1) Beveiliging: kind moet ingelogd zijn (blijft ingelogd tot expliciet uitloggen)
  function ensureKidLoggedIn(){
    const a = localStorage.getItem("kindIngelogd");   // "ja" (zoals jij gebruikt)
    const b = localStorage.getItem("kind_ingelogd");  // "true" (compat)
    if(a !== "ja" && b !== "true"){
      window.location.replace("https://kathy-torfs.github.io/Orthodoxeweg/kindermodus/inloggen.html");
      return false;
    }
    return true;
  }

  // 2) Firebase scripts laden (compat) indien nodig
  function loadFirebaseIfNeeded(cb){
    if (window.firebase?.apps?.length){
      cb(); return;
    }
    const app = document.createElement("script");
    app.src = "https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js";
    const fs = document.createElement("script");
    fs.src  = "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore-compat.js";

    fs.onload = () => {
      if (!firebase.apps.length){
        firebase.initializeApp({
          apiKey:"AIzaSyBG1iQBmruHUZI1OeW8RgbJ_TPit_7a2LQ",
          authDomain:"orthodoxeweg.firebaseapp.com",
          projectId:"orthodoxeweg",
          storageBucket:"orthodoxeweg.appspot.com",
          messagingSenderId:"408582263618",
          appId:"1:408582263618:web:0a20f4bf0704989d3ceedb"
        });
      }
      cb();
    };
    app.onload = () => document.head.appendChild(fs);
    document.head.appendChild(app);
  }

  // 3) Header HTML inladen
  async function mountHeader(){
    const mount = document.getElementById(HEADER_MOUNT_ID);
    if(!mount){ console.warn(`[layout] <div id="${HEADER_MOUNT_ID}"></div> ontbreekt.`); return; }

    const res = await fetch(HEADER_URL, { cache:"no-store" });
    mount.innerHTML = await res.text();
    wireHeader();
  }

  // 4) Begroeting + uitloggen + live punten
  function wireHeader(){
    // Begroeting met naam
    const naam = localStorage.getItem("ingelogdKindVoornaam") || "Kind";
    const h = new Date().getHours();
    const groet = (h>=6 && h<=11) ? "Goeiemorgen" : (h<=16) ? "Goeiemiddag" : (h<=22) ? "Goeieavond" : "Hallo";
    const groetEl = document.getElementById("groet-tekst");
    if (groetEl) groetEl.textContent = `${groet}, ${naam}!`;

    // Uitloggen
    const outBtn = document.getElementById("uitlogBtn");
    if (outBtn){
      outBtn.onclick = () => {
        // enkel kind-keys leegmaken
        localStorage.removeItem("kindIngelogd");
        localStorage.removeItem("kind_ingelogd");
        localStorage.removeItem("ingelogdKindId");
        localStorage.removeItem("ingelogdKindVoornaam");
        localStorage.removeItem("kindAvatarURL");
        localStorage.removeItem("kindPunten");
        window.location.replace("https://kathy-torfs.github.io/Orthodoxeweg/kindermodus/inloggen.html");
      };
    }

    // Live punten teller via Firestore
    const parochieId = localStorage.getItem("ingelogdeParochie");
    const ouderLogin = localStorage.getItem("loginKeuze");
    const kindId     = localStorage.getItem("ingelogdKindId");
    const tellerEl   = document.getElementById("punten-teller");

    if (parochieId && ouderLogin && kindId && tellerEl){
      const db = firebase.firestore();
      db.collection("parochies").doc(parochieId)
        .collection("leden").doc(ouderLogin)
        .collection("kinderen").doc(kindId)
        .onSnapshot(snap=>{
          const punten = snap.exists ? (snap.data().punten || 0) : 0;
          tellerEl.textContent = punten;
          tellerEl.style.transform = "scale(1.18)";
          setTimeout(()=> tellerEl.style.transform = "scale(1)", 160);
        }, _err=>{
          tellerEl.textContent = "…";
        });
    }
  }

  // Boot
  if (!ensureKidLoggedIn()) return;
  loadFirebaseIfNeeded(mountHeader);
})();
