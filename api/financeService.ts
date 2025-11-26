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
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  runTransaction,
  where,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Invoice, NewInvoiceData, Contract, NewContractData } from '../types';

const invoicesCollectionRef = db ? collection(db, 'invoices') : null;
const contractsCollectionRef = db ? collection(db, 'contracts') : null;

// --- Invoices ---

const fromInvoiceFirestore = (docSnapshot: QueryDocumentSnapshot<DocumentData>): Invoice => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    tenantId: data.tenantId,
    invoiceNumber: data.invoiceNumber,
    clientName: data.clientName,
    issueDate: (data.issueDate as Timestamp)?.toDate().toISOString(),
    dueDate: (data.dueDate as Timestamp)?.toDate().toISOString(),
    items: data.items || [],
    total: data.total,
    status: data.status,
  };
};

export const getInvoices = async (tenantId: string): Promise<Invoice[]> => {
  if (!invoicesCollectionRef) throw new Error("Firebase is not properly configured.");
  const q = query(invoicesCollectionRef, where("tenantId", "==", tenantId));
  const snapshot = await getDocs(q);
  const invoices = snapshot.docs.map(fromInvoiceFirestore);
  return invoices.sort((a, b) => b.invoiceNumber - a.invoiceNumber);
};

export const addInvoice = async (tenantId: string, invoiceData: Omit<NewInvoiceData, 'tenantId'>): Promise<Invoice> => {
    if (!db) throw new Error("Firebase not configured.");
    const counterRef = doc(db, 'counters', `invoices_${tenantId}`);
  
    let newInvoiceNumber: number;
  
    try {
      newInvoiceNumber = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        if (!counterDoc.exists()) {
          transaction.set(counterRef, { currentNumber: 1 });
          return 1;
        }
        const newNumber = counterDoc.data().currentNumber + 1;
        transaction.update(counterRef, { currentNumber: newNumber });
        return newNumber;
      });
    } catch (e) {
      console.error("Transaction failed: ", e);
      throw new Error("Could not generate a new invoice number.");
    }

    const fullInvoiceData = { ...invoiceData, tenantId, invoiceNumber: newInvoiceNumber };
    const docRef = await addDoc(invoicesCollectionRef!, {
        ...fullInvoiceData,
        issueDate: Timestamp.fromDate(new Date(invoiceData.issueDate)),
        dueDate: Timestamp.fromDate(new Date(invoiceData.dueDate)),
    });

    return { ...fullInvoiceData, id: docRef.id };
};

export const updateInvoice = async (tenantId: string, { id, data }: { id: string, data: Partial<Invoice> }): Promise<void> => {
    if (!db) throw new Error("Firebase not configured.");
    const invoiceDoc = doc(db, 'invoices', id);
    // Add security check here
    await updateDoc(invoiceDoc, data);
};

// --- Contracts ---

const fromContractFirestore = (docSnapshot: QueryDocumentSnapshot<DocumentData>): Contract => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    tenantId: data.tenantId,
    ...data,
    startDate: (data.startDate as Timestamp)?.toDate().toISOString(),
    endDate: (data.endDate as Timestamp)?.toDate().toISOString(),
  } as Contract;
};

export const getContracts = async (tenantId: string): Promise<Contract[]> => {
  if (!contractsCollectionRef) throw new Error("Firebase is not properly configured.");
  const q = query(contractsCollectionRef, where("tenantId", "==", tenantId));
  const snapshot = await getDocs(q);
  const contracts = snapshot.docs.map(fromContractFirestore);
  return contracts.sort((a, b) => a.name.localeCompare(b.name));
};

export const addContract = async (tenantId: string, contractData: Omit<NewContractData, 'tenantId'>): Promise<Contract> => {
  if (!contractsCollectionRef) throw new Error("Firebase is not properly configured.");
  const fullContractData = { ...contractData, tenantId };
  const docRef = await addDoc(contractsCollectionRef, {
    ...fullContractData,
    startDate: Timestamp.fromDate(new Date(contractData.startDate)),
    endDate: Timestamp.fromDate(new Date(contractData.endDate)),
  });
  return { id: docRef.id, ...fullContractData };
};

export const updateContract = async (tenantId: string, { id, data }: { id: string, data: Partial<NewContractData> }): Promise<void> => {
    if (!db) throw new Error("Firebase not configured.");
    const contractDoc = doc(db, 'contracts', id);
    // Add security check here
    const dataToUpdate: any = { ...data };
    if(data.startDate) dataToUpdate.startDate = Timestamp.fromDate(new Date(data.startDate));
    if(data.endDate) dataToUpdate.endDate = Timestamp.fromDate(new Date(data.endDate));

    await updateDoc(contractDoc, dataToUpdate);
};

export const deleteContract = async (tenantId: string, contractId: string): Promise<void> => {
    if (!db) throw new Error("Firebase not configured.");
    const contractDoc = doc(db, 'contracts', contractId);
    const docSnap = await getDoc(contractDoc);
    if (!docSnap.exists() || docSnap.data().tenantId !== tenantId) {
        throw new Error("Permission denied or contract not found.");
    }
    await deleteDoc(contractDoc);
};