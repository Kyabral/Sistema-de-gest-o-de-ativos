import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import { Deal } from '../types';

const dealsCollectionRef = db ? collection(db, 'deals') : null;

const fromFirestore = (docSnapshot: QueryDocumentSnapshot<DocumentData>): Deal => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    tenantId: data.tenantId,
    title: data.title,
    clientName: data.clientName,
    value: data.value,
    stage: data.stage,
    probability: data.probability,
    expectedCloseDate: (data.expectedCloseDate as Timestamp)?.toDate().toISOString().split('T')[0],
    owner: data.owner,
  };
};

export const getDeals = async (tenantId: string): Promise<Deal[]> => {
  if (!dealsCollectionRef) throw new Error("Firebase not configured");
  const q = query(dealsCollectionRef, where("tenantId", "==", tenantId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(fromFirestore);
};

export const addDeal = async (tenantId: string, dealData: Omit<Deal, 'id' | 'tenantId'>): Promise<Deal> => {
  if (!dealsCollectionRef) throw new Error("Firebase not configured");
  const docRef = await addDoc(dealsCollectionRef, {
    ...dealData,
    tenantId,
    expectedCloseDate: Timestamp.fromDate(new Date(dealData.expectedCloseDate)),
  });
  return { id: docRef.id, tenantId, ...dealData };
};

export const updateDeal = async (tenantId: string, deal: Deal): Promise<void> => {
  if (!db) throw new Error("Firebase not configured");
  const docRef = doc(db, 'deals', deal.id);
  await updateDoc(docRef, {
    ...deal,
    expectedCloseDate: Timestamp.fromDate(new Date(deal.expectedCloseDate)),
  });
};

export const deleteDeal = async (tenantId: string, dealId: string): Promise<void> => {
    if (!db) throw new Error("Firebase not configured");
    const docRef = doc(db, 'deals', dealId);
    await deleteDoc(docRef);
};
