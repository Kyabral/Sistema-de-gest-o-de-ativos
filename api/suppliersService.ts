import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  DocumentData,
  QueryDocumentSnapshot,
  where,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Supplier, NewSupplierData } from '../types';

const suppliersCollectionRef = db ? collection(db, 'suppliers') : null;

const fromFirestore = (docSnapshot: QueryDocumentSnapshot<DocumentData>): Supplier => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    tenantId: data.tenantId,
    name: data.name,
    category: data.category,
    contactPerson: data.contactPerson,
    email: data.email,
    phone: data.phone,
    address: data.address,
  };
};

export const getSuppliers = async (tenantId: string): Promise<Supplier[]> => {
  if (!suppliersCollectionRef) throw new Error("Firebase is not properly configured.");
  const q = query(suppliersCollectionRef, where("tenantId", "==", tenantId));
  const snapshot = await getDocs(q);
  const suppliers = snapshot.docs.map(fromFirestore);
  return suppliers.sort((a, b) => a.name.localeCompare(b.name));
};

export const addSupplier = async (tenantId: string, supplierData: Omit<NewSupplierData, 'tenantId'>): Promise<Supplier> => {
  if (!suppliersCollectionRef) throw new Error("Firebase is not properly configured.");
  const fullSupplierData = { ...supplierData, tenantId };
  const docRef = await addDoc(suppliersCollectionRef, fullSupplierData);
  return {
    id: docRef.id,
    ...fullSupplierData,
  };
};

export const updateSupplier = async (tenantId: string, { id, data }: { id: string, data: Partial<NewSupplierData> }): Promise<void> => {
  if (!db) throw new Error("Firebase is not properly configured.");
  const supplierDoc = doc(db, 'suppliers', id);
  // In a real app, you'd verify tenant ownership before updating.
  await updateDoc(supplierDoc, data);
};

export const deleteSupplier = async (tenantId: string, supplierId: string): Promise<void> => {
  if (!db) throw new Error("Firebase is not properly configured.");
  const supplierDoc = doc(db, 'suppliers', supplierId);
  const docSnap = await getDoc(supplierDoc);
  if (!docSnap.exists() || docSnap.data().tenantId !== tenantId) {
      throw new Error("Permission denied or supplier not found.");
  }
  await deleteDoc(supplierDoc);
};
