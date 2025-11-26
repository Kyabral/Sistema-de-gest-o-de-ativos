
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  where,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { PurchaseRequisition, NewPurchaseRequisitionData, PurchaseOrder, NewPurchaseOrderData, RequestForQuotation, NewRequestForQuotationData } from '../types';

const requisitionsCollectionRef = db ? collection(db, 'purchaseRequisitions') : null;
const ordersCollectionRef = db ? collection(db, 'purchaseOrders') : null;
const rfqsCollectionRef = db ? collection(db, 'rfqs') : null;


// Requisitions
const requisitionFromFirestore = (docSnapshot: QueryDocumentSnapshot<DocumentData>): PurchaseRequisition => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    tenantId: data.tenantId,
    requesterName: data.requesterName,
    requestDate: (data.requestDate as Timestamp)?.toDate().toISOString(),
    items: data.items || [], // Ensure 'items' is always an array
    status: data.status,
    justification: data.justification,
    attachmentName: data.attachmentName,
    attachmentUrl: data.attachmentUrl,
    cancellationReason: data.cancellationReason,
  };
};

export const getPurchaseRequisitions = async (tenantId: string): Promise<PurchaseRequisition[]> => {
  if (!requisitionsCollectionRef) throw new Error("Firebase is not properly configured.");
  const q = query(requisitionsCollectionRef, where("tenantId", "==", tenantId));
  const snapshot = await getDocs(q);
  const requisitions = snapshot.docs.map(requisitionFromFirestore);
  return requisitions.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
};

export const addPurchaseRequisition = async (tenantId: string, reqData: Omit<NewPurchaseRequisitionData, 'tenantId'>): Promise<PurchaseRequisition> => {
  if (!requisitionsCollectionRef) throw new Error("Firebase is not properly configured.");

  const dataToSave: { [key: string]: any } = {
    tenantId,
    requesterName: reqData.requesterName,
    requestDate: Timestamp.fromDate(new Date(reqData.requestDate)),
    items: reqData.items,
    status: reqData.status,
  };

  // Only add optional fields if they have a value to prevent sending 'undefined'.
  if (reqData.justification) {
    dataToSave.justification = reqData.justification;
  }
  if (reqData.attachmentName) {
    dataToSave.attachmentName = reqData.attachmentName;
  }
  if (reqData.attachmentUrl) {
    dataToSave.attachmentUrl = reqData.attachmentUrl;
  }
  if (reqData.cancellationReason) {
    dataToSave.cancellationReason = reqData.cancellationReason;
  }

  const docRef = await addDoc(requisitionsCollectionRef, dataToSave);
  return { id: docRef.id, tenantId, ...reqData };
};

export const updatePurchaseRequisition = async (tenantId: string, req: PurchaseRequisition): Promise<void> => {
  if (!db) throw new Error("Firebase is not properly configured.");
  if (req.tenantId !== tenantId) throw new Error("Permission denied.");
  const reqDoc = doc(db, 'purchaseRequisitions', req.id);
  const dataToUpdate = { ...req };
  delete (dataToUpdate as any).id;
  
  const payload: any = {
      ...dataToUpdate,
      requestDate: Timestamp.fromDate(new Date(dataToUpdate.requestDate))
  };

  // Ensure optional fields are handled correctly (undefined values can cause issues with updateDoc in some SDK versions, though typically handled, explicit is safer)
  if (req.cancellationReason === undefined) {
      delete payload.cancellationReason;
  }
  
  await updateDoc(reqDoc, payload);
};

// Orders
const orderFromFirestore = (docSnapshot: QueryDocumentSnapshot<DocumentData>): PurchaseOrder => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    tenantId: data.tenantId,
    requisitionId: data.requisitionId,
    supplierId: data.supplierId,
    orderDate: (data.orderDate as Timestamp)?.toDate().toISOString(),
    items: data.items || [], // Safely default items to an empty array
    totalValue: data.totalValue,
    status: data.status,
    receivedItems: data.receivedItems?.map((item: any) => ({
        ...item,
        receivedDate: (item.receivedDate as Timestamp)?.toDate().toISOString(),
    })) || [],
    expectedDeliveryDate: (data.expectedDeliveryDate as Timestamp)?.toDate().toISOString(),
  } as PurchaseOrder;
};

export const getPurchaseOrders = async (tenantId: string): Promise<PurchaseOrder[]> => {
  if (!ordersCollectionRef) throw new Error("Firebase is not properly configured.");
  const q = query(ordersCollectionRef, where("tenantId", "==", tenantId));
  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map(orderFromFirestore);
  return orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
};

export const addPurchaseOrder = async (tenantId: string, orderData: Omit<NewPurchaseOrderData, 'tenantId'>): Promise<PurchaseOrder> => {
  if (!ordersCollectionRef) throw new Error("Firebase is not properly configured.");
  const docRef = await addDoc(ordersCollectionRef, {
    ...orderData,
    tenantId,
    orderDate: Timestamp.fromDate(new Date(orderData.orderDate)),
    ...(orderData.expectedDeliveryDate && { expectedDeliveryDate: Timestamp.fromDate(new Date(orderData.expectedDeliveryDate))}),
    receivedItems: [],
  });
  return { id: docRef.id, tenantId, ...orderData, receivedItems: [] };
};

export const updatePurchaseOrder = async (tenantId: string, order: PurchaseOrder): Promise<void> => {
  if (!db) throw new Error("Firebase is not properly configured.");
  if (order.tenantId !== tenantId) throw new Error("Permission denied.");
  const orderDoc = doc(db, 'purchaseOrders', order.id);
  const dataToUpdate = { ...order };
  delete (dataToUpdate as any).id;

  await updateDoc(orderDoc, {
    ...dataToUpdate,
    orderDate: Timestamp.fromDate(new Date(dataToUpdate.orderDate)),
    ...(dataToUpdate.expectedDeliveryDate && { expectedDeliveryDate: Timestamp.fromDate(new Date(dataToUpdate.expectedDeliveryDate))}),
    receivedItems: dataToUpdate.receivedItems.map((item: any) => ({
        ...item,
        receivedDate: Timestamp.fromDate(new Date(item.receivedDate)),
    })),
  });
};

// RFQs
const rfqFromFirestore = (docSnapshot: QueryDocumentSnapshot<DocumentData>): RequestForQuotation => {
    const data = docSnapshot.data();
    return {
        id: docSnapshot.id,
        tenantId: data.tenantId,
        requisitionId: data.requisitionId,
        creationDate: (data.creationDate as Timestamp)?.toDate().toISOString(),
        sentToSupplierIds: data.sentToSupplierIds || [],
        items: data.items || [],
        status: data.status,
        quotes: data.quotes?.map((q: any) => ({
            ...q,
            quoteDate: (q.quoteDate as Timestamp)?.toDate().toISOString(),
            validUntil: (q.validUntil as Timestamp)?.toDate().toISOString(),
        })) || [],
    } as RequestForQuotation;
};

export const getRequestForQuotations = async (tenantId: string): Promise<RequestForQuotation[]> => {
    if (!rfqsCollectionRef) throw new Error("Firebase is not properly configured.");
    const q = query(rfqsCollectionRef, where("tenantId", "==", tenantId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(rfqFromFirestore).sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
};

export const addRequestForQuotation = async (tenantId: string, rfqData: Omit<NewRequestForQuotationData, 'tenantId'>): Promise<RequestForQuotation> => {
    if (!rfqsCollectionRef) throw new Error("Firebase is not properly configured.");
    const docRef = await addDoc(rfqsCollectionRef, {
        ...rfqData,
        tenantId,
        creationDate: Timestamp.fromDate(new Date(rfqData.creationDate)),
        quotes: [],
    });
    return { id: docRef.id, tenantId, ...rfqData, quotes: [] };
};

export const updateRequestForQuotation = async (tenantId: string, rfq: RequestForQuotation): Promise<void> => {
    if (!db) throw new Error("Firebase is not properly configured.");
    if (rfq.tenantId !== tenantId) throw new Error("Permission denied.");
    const rfqDoc = doc(db, 'rfqs', rfq.id);
    const dataToUpdate = { ...rfq };
    delete (dataToUpdate as any).id;
    await updateDoc(rfqDoc, {
        ...dataToUpdate,
        creationDate: Timestamp.fromDate(new Date(dataToUpdate.creationDate)),
        quotes: dataToUpdate.quotes.map((q: any) => ({
            ...q,
            quoteDate: Timestamp.fromDate(new Date(q.quoteDate)),
            validUntil: Timestamp.fromDate(new Date(q.validUntil)),
        }))
    });
};
