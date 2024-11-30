import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
apiKey: "AIzaSyA2SCfa4rV25wriQdCnBTOkuge97i6Ro-8",
  authDomain: "skill-share-cbd51.firebaseapp.com",
  projectId: "skill-share-cbd51",
  storageBucket: "skill-share-cbd51.firebasestorage.app",
  messagingSenderId: "197272069248",
  appId: "1:197272069248:web:0391c262f9d2efaba6f265",
  measurementId: "G-42HN9HP2CP"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);






