import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBl8QwvuFjGSCy-SxlRxbZZ8eqdbbAMBx8",
  authDomain: "inventory-20248.firebaseapp.com",
  projectId: "inventory-20248",
  storageBucket: "inventory-20248.firebasestorage.app",
  messagingSenderId: "732972722987",
  appId: "1:732972722987:web:eccd5cac27654e2460f36e",
  measurementId: "G-CRCLLG0811"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
