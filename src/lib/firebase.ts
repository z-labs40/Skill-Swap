// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXNFpMwdchp2mwAOBDejdF9-WyVsKhtSI",
  authDomain: "erp-b2b69.firebaseapp.com",
  projectId: "erp-b2b69",
  storageBucket: "erp-b2b69.firebasestorage.app",
  messagingSenderId: "112018728654",
  appId: "1:112018728654:web:c8948b61a4c8da5111d29f",
  measurementId: "G-MLVE60GMRF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
