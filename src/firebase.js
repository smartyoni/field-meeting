// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGPc7bVMr79ajAiCaVk4kXhdSDhY0RgHk",
  authDomain: "field-meeting.firebaseapp.com",
  projectId: "field-meeting",
  storageBucket: "field-meeting.firebasestorage.app",
  messagingSenderId: "360592747342",
  appId: "1:360592747342:web:abab50459ed433987d4c1f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };