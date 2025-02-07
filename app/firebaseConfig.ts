import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "",
  authDomain: "projekt-zesp.firebaseapp.com",
  projectId: "projekt-zesp",
  storageBucket: "projekt-zesp.firebasestorage.app",
  messagingSenderId: "",
  appId: "",
  measurementId: "G-RRHN984TEE",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
