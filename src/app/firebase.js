// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAXmmVjHOzZyHFJ7LtcEUHloGLzZPxdi4A",
  authDomain: "tcoins-340c0.firebaseapp.com",
  projectId: "tcoins-340c0",
  storageBucket: "tcoins-340c0.firebasestorage.app",
  messagingSenderId: "644980094758",
  appId: "1:644980094758:web:21c3c1c0172962479ff3e7",
  measurementId: "G-VD4Y53ND2V"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider(); // ✅ Define it here

export {
  auth,
  db,
  googleProvider,
  signInWithPopup, // ✅ Export this too
  collection,
  getDocs,
  addDoc,
};
