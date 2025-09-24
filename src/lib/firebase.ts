import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCAQkleTFWyoEcCNIeYzpZ1NwcEHv5NN0U",
  authDomain: "flame143-a5106.firebaseapp.com",
  projectId: "flame143-a5106",
  storageBucket: "flame143-a5106.firebasestorage.app",
  messagingSenderId: "243471809617",
  appId: "1:243471809617:web:8ea9a5e8de72c4f5b6cc70",
  measurementId: "G-XN9SZ6F94M"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);