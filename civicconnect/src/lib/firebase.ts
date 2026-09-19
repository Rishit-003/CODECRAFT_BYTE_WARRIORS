import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCDF1lgtcaZuAqxBLpmi0TqzdIRxeghoT0",
  authDomain: "civicconnect-ea129.firebaseapp.com",
  projectId: "civicconnect-ea129",
  storageBucket: "civicconnect-ea129.firebasestorage.app",
  messagingSenderId: "474640980989",
  appId: "1:474640980989:web:9a02e1a3770d24fc9bd794",
  measurementId: "G-V2H5FRNPB5"
};

// Initialize Firebase (Singleton pattern for Next.js)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getApps().length > 0 
  ? getFirestore(app) 
  : initializeFirestore(app, { experimentalForceLongPolling: true });

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);

export { app, db, storage };
