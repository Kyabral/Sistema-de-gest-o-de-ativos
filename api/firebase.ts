import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCECBR1DtgKsr26Fsp1m2gqZGlAOMsUMcY",
  authDomain: "sistema-de-gestao-de-ativos.firebaseapp.com",
  projectId: "sistema-de-gestao-de-ativos",
  storageBucket: "sistema-de-gestao-de-ativos.appspot.com",
  messagingSenderId: "178570353251",
  appId: "1:178570353251:web:6a4b4801d896e0bc7c7656"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
// Use the new modular API to enable multi-tab persistence which is recommended over enableIndexedDbPersistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
});


// Initialize Firebase Authentication
const auth = getAuth(app);

export { db, auth };