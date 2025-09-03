'use client';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAtILRnl2gMOEPkHVQ4s1nf1VGOvAXTlVY",
  authDomain: "material-react-9fb66.firebaseapp.com",
  projectId: "material-react-9fb66",
  storageBucket: "material-react-9fb66.firebasestorage.app",
  messagingSenderId: "465829223152",
  appId: "1:465829223152:web:7d09533bdcd5ef82040035",
  measurementId: "G-T9DE3SSHXC"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
