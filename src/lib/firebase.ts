import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBeML0XWlxi5p8L7IBWIrwIRu8jSsknqW4",
  authDomain: "thrive-e71af.firebaseapp.com",
  projectId: "thrive-e71af",
  storageBucket: "thrive-e71af.firebasestorage.app",
  messagingSenderId: "857781261264",
  appId: "1:857781261264:web:8853effc143e5932bddfd5",
  measurementId: "G-TG4E290F1G"
};

// Initialize Firebase securely for SSR and Client
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Analytics is only available on the client
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics };
