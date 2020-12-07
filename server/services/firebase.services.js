let adminFirebase = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

adminFirebase.initializeApp({
  credential: adminFirebase.credential.cert(serviceAccount),
  databaseURL: "https://newone-96b5e.firebaseio.com"
});


module.exports = {
  adminFirebase,
};
