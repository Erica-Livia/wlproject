const admin = require('../utils/firebaseAdmin');
const db = admin.firestore();

const storeUserData = async (userId, role) => {
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.set({ role: role });
    console.log('User role saved to Firestore');
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

module.exports = storeUserData;
