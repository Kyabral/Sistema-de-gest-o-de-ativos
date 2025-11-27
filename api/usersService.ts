
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, BrandingSettings } from '../types';

// Re-export mock functions for development
export { getTenantBranding, updateTenantBranding } from './mock/brandingService';

const usersCollectionRef = db ? collection(db, 'users') : null;

const fromFirestore = (doc: QueryDocumentSnapshot<DocumentData>): User => {
    const data = doc.data();
    return {
        uid: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        tenantId: data.tenantId,
        status: data.status,
    };
};

export const getUsersForTenant = async (tenantId: string): Promise<User[]> => {
  if (!usersCollectionRef) throw new Error("Firebase não está configurado corretamente.");
  const q = query(usersCollectionRef, where("tenantId", "==", tenantId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(fromFirestore);
};

export const inviteUser = async (tenantId: string, userData: { name: string; email: string; role: User['role'] }): Promise<User> => {
    if (!usersCollectionRef) throw new Error("Firebase não está configurado corretamente.");
    const newUserDoc = {
        ...userData,
        tenantId,
        status: 'invited',
        createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(usersCollectionRef, newUserDoc);
    return { uid: docRef.id, name: userData.name, email: userData.email, role: userData.role, tenantId, status: 'invited' };
};

export const updateUserRole = async (tenantId: string, { userId, role }: { userId: string, role: User['role'] }): Promise<void> => {
    if (!db) throw new Error("Firebase não configurado.");
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { role });
};

export const deleteUser = async (tenantId: string, userId: string): Promise<void> => {
    if (!db) throw new Error("Firebase não configurado.");
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);
};

// --- Original Firebase Branding & Settings Persistence ---
/*
export const getTenantBranding = async (tenantId: string): Promise<Partial<BrandingSettings> | null> => {
    if (!db) return null;
    const settingsDocRef = doc(db, 'settings', tenantId);
    const docSnap = await getDoc(settingsDocRef);
    
    if (docSnap.exists()) {
        return docSnap.data() as Partial<BrandingSettings>;
    }
    
    const userDocRef = doc(db, 'users', tenantId);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.companyName) {
            return { companyName: userData.companyName };
        }
    }

    return null;
};

export const updateTenantBranding = async (tenantId: string, settings: BrandingSettings): Promise<void> => {
    if (!db) throw new Error("Firebase não configurado.");
    const settingsDocRef = doc(db, 'settings', tenantId);
    await setDoc(settingsDocRef, settings, { merge: true });
    
    const userDocRef = doc(db, 'users', tenantId);
    await updateDoc(userDocRef, { companyName: settings.companyName }).catch(() => {});
};
*/
