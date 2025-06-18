const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase-admin.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "affirmation-dcb89",
    storageBucket: "affirmation-dcb89.appspot.com",
    messagingSenderId: "943424358644",
  });
}

module.exports = admin;
