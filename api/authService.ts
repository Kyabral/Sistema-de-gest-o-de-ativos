import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  getIdTokenResult,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserRegistrationData, User, CustomClaims } from '../types';
import { logger } from '../utils/logger';

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {}; // Return an empty unsubscribe function
  }
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const tokenResult = await getIdTokenResult(firebaseUser, true); // Force refresh to get latest claims
      const claims = tokenResult.claims as CustomClaims;
      
      // FIX: Since Cloud Functions may not be deployed, we ensure tenantId is set to the user's UID as a fallback.
      // This mimics the logic of the `setCustomClaimsOnCreate` function for a single-tenant-per-user model.
      const tenantId = claims.tenantId || firebaseUser.uid;

      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        // Default new users to admin to allow full access, mimicking the Cloud Function's intent for the first user.
        role: claims.role || 'admin',
        tenantId: tenantId,
      };
      logger.setUser(user);
      callback(user);
    } else {
      logger.clearUser();
      callback(null);
    }
  });
};

export const signUp = async (userData: UserRegistrationData): Promise<void> => {
  if (!auth || !db) throw new Error("Firebase Auth ou Firestore não inicializado.");
  
  const { name, email, password, companyName, phone } = userData;
  if (!email || !password || !name || !companyName) {
    throw new Error('Todos os campos obrigatórios devem ser preenchidos.');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await updateProfile(user, { displayName: name });
  
  // The 'tenantId' and 'role' custom claims will be set by a Cloud Function trigger.
  // The client-side code doesn't need to handle it. It will be available on the token
  // automatically after the function runs. We add it here to simulate the function.
  
  // Create user profile in Firestore
  const userDocRef = doc(db, "users", user.uid);
  await setDoc(userDocRef, {
    uid: user.uid,
    name,
    email,
    companyName,
    phone: phone || null,
    createdAt: serverTimestamp(),
    tenantId: user.uid, // The user's UID becomes their tenant ID on signup
    role: 'admin',      // The first user is always an admin
    status: 'active',   // Set status to active
  });
};

export const signIn = async (email: string, password: string, rememberMe: boolean): Promise<void> => {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  
  const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistence);

  await signInWithEmailAndPassword(auth, email, password);
};

export const logOut = async (): Promise<void> => {
  if (!auth) return;
  await signOut(auth);
};