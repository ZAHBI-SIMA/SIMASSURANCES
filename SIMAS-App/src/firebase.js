// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyABJnuxhA275r0QDNR8v--rXuelXGTtsBw",
    authDomain: "simasapp-4e81b.firebaseapp.com",
    projectId: "simasapp-4e81b",
    storageBucket: "simasapp-4e81b.firebasestorage.app",
    messagingSenderId: "934335843070",
    appId: "1:934335843070:web:23e5770df6d9048680b3af"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
