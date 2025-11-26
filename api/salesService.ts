
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { SalesOrder } from '../types';

const salesCollectionRef = db ? collection(db, 'salesOrders') : null;

const fromFirestore = (docSnapshot: QueryDocumentSnapshot<DocumentData>): SalesOrder => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    tenantId: data.tenantId,
    customerName: data.customerName,
    date: (data.date as Timestamp)?.toDate().toISOString(),
    total: data.total,
    status: data.status,
    items: data.items || [],
  };
};

export const getSalesOrders = async (tenantId: string): Promise<SalesOrder[]> => {
  if (!salesCollectionRef) throw new Error("Firebase is not properly configured.");
  const q = query(salesCollectionRef, where("tenantId", "==", tenantId));
  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map(fromFirestore);
  // Sort by date descending
  return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addSalesOrder = async (tenantId: string, orderData: Omit<SalesOrder, 'id' | 'tenantId'>): Promise<SalesOrder> => {
  if (!salesCollectionRef) throw new Error("Firebase is not properly configured.");
  
  const docRef = await addDoc(salesCollectionRef, {
    ...orderData,
    tenantId,
    date: Timestamp.fromDate(new Date(orderData.date)),
  });

  return {
    id: docRef.id,
    tenantId,
    ...orderData,
  };
};

export const updateSalesOrderStatus = async (tenantId: string, orderId: string, status: SalesOrder['status']): Promise<void> => {
    if (!db) throw new Error("Firebase is not properly configured.");
    const orderDoc = doc(db, 'salesOrders', orderId);
    await updateDoc(orderDoc, { status });
};
