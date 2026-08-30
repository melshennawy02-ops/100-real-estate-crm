/* =========================================================
   Firebase configuration
   ========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyBvKB7VeUxGu9XEGSqb-2m7xh1P6O01BVw",
  authDomain: "real-estate-crm-65b58.firebaseapp.com",
  projectId: "real-estate-crm-65b58",
  storageBucket: "real-estate-crm-65b58.firebasestorage.app",
  messagingSenderId: "487150093988",
  appId: "1:487150093988:web:021b0134b784641e6e8831"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
