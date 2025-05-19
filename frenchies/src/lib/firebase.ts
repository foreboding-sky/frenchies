// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBB1V82UAJxkX55EGP9uWyk5eX6Qw6-T8k",
    authDomain: "frenchies-sweuccc.firebaseapp.com",
    projectId: "frenchies-sweuccc",
    storageBucket: "frenchies-sweuccc.firebasestorage.app",
    messagingSenderId: "722909031468",
    appId: "1:722909031468:web:0056a512425fc11b637589"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
