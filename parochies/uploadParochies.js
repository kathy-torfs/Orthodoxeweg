// uploadParochies.js

const admin = require("firebase-admin");
const fs = require("fs");

// 🔑 Laad de service account key uit de bovenliggende map
const serviceAccount = require("../serviceAccountKey.json");

// 🔧 Initialiseer Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 📥 Lees parochies in uit JSON-bestand (zelfde map)
const parochies = JSON.parse(fs.readFileSync("parochies.json", "utf8"));

// 🚀 Upload elke parochie naar Firestore met ID uit JSON
async function upload() {
  for (const parochie of parochies) {
    const docId = parochie.id; // gebruik 'id' uit JSON als document-ID
    await db.collection("parochies").doc(docId).set(parochie);
    console.log(`✅ Parochie '${parochie.naam}' geüpload als ID '${docId}'`);
  }
  console.log("🌟 Upload van alle parochies voltooid!");
}

upload();
