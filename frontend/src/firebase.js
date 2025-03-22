import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA6RTWmNRLCk8LIfP8R7wSOtwGsqA_LyF0",
    authDomain: "wanderlust-82d86.firebaseapp.com",
    projectId: "wanderlust-82d86",
    storageBucket: "wanderlust-82d86.firebasestorage.app",
    messagingSenderId: "27323676668",
    appId: "1:27323676668:web:c387d69284e2c485e8a479",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

// Set persistence to "local" (persists across page refreshes)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Authentication state persistence enabled.");
  })
  .catch((error) => {
    console.error("Error enabling persistence:", error);
  });

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, storage };