// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDI34cJ_jMMjDgM-kr1vfoZlHBoPgTnAkM",
  authDomain: "career-test-b0769.firebaseapp.com",
  projectId: "career-test-b0769",
  storageBucket: "career-test-b0769.firebasestorage.app",
  messagingSenderId: "309231346456",
  appId: "1:309231346456:web:36068fd374d6817cc4f46d",
  measurementId: "G-RWQFPQZZGM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };