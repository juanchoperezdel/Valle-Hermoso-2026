import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9hVl_A16TLYl8VLBpVkfZtL3aayOFJ-0",
  authDomain: "valle-hermoso-b7748.firebaseapp.com",
  projectId: "valle-hermoso-b7748",
  storageBucket: "valle-hermoso-b7748.firebasestorage.app",
  messagingSenderId: "404978364342",
  appId: "1:404978364342:web:ed0b66cb62ed433863db17",
  measurementId: "G-4BVEVJ1HQQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
