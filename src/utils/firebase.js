const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase-admin.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "wishara-3fc91",
    storageBucket: "wishara-3fc91.firebasestorage.app",
    messagingSenderId: "630149572513",
  });
}

module.exports = admin;
