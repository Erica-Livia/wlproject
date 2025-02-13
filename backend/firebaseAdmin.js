const admin = require('firebase-admin');
const serviceAccount = require('firebaseConfig.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://wanderlust-82d86.firebaseio.com"
});

module.exports = admin;
 