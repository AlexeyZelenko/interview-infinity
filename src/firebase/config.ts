import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyBuaL7AwIpEhb2MRGx7kPeq1EuXtk4cFbo",
  authDomain: "interview-infinity.firebaseapp.com",
  projectId: "interview-infinity",
  storageBucket: "interview-infinity.appspot.com",
  messagingSenderId: "750444056552",
  appId: "1:750444056552:web:9a136022134a03e313de5d",
  measurementId: "G-6BQ5ZMED9V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

