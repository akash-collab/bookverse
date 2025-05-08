import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js"; 

const firebaseConfig = {
    apiKey: "AIzaSyD1XpWlQeWkTnVcMlc8vnJrjsAx9I5begM",
    authDomain: "bookverse-5ffe8.firebaseapp.com",
    projectId: "bookverse-5ffe8",
    storageBucket: "bookverse-5ffe8.firebasestorage.app",
    messagingSenderId: "340488061709",
    appId: "1:340488061709:web:b94dd9ba9990ad7963a644",
    measurementId: "G-G317Q4X1HM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);