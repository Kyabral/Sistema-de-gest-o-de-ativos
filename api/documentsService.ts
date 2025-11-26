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
import { CompanyDocument, NewCompanyDocumentData } from '../types';

const documentsCollectionRef = db ? collection(db, 'companyDocuments') : null;

const fromFirestore = (docSnapshot: QueryDocumentSnapshot<DocumentData>): CompanyDocument => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    tenantId: data.tenantId,
    name: data.name,
    category: data.category,
    tags: data.tags || [],
    uploadDate: (data.uploadDate as Timestamp)?.toDate().toISOString(),
    expiryDate: (data.expiryDate as Timestamp)?.toDate().toISOString() || undefined,
    fileUrl: data.fileUrl,
  };
};

export const getCompanyDocuments = async (tenantId: string): Promise<CompanyDocument[]> => {
  if (!documentsCollectionRef) throw new Error("Firebase is not properly configured.");
  const q = query(documentsCollectionRef, where("tenantId", "==", tenantId));
  const snapshot = await getDocs(q);
  const documents = snapshot.docs.map(fromFirestore);
  return documents.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
};

export const addCompanyDocument = async (tenantId: string, docData: Omit<NewCompanyDocumentData, 'tenantId'>): Promise<CompanyDocument> => {
  if (!documentsCollectionRef) throw new Error("Firebase is not properly configured.");
  const fullDocData = { ...docData, tenantId };
  const docRef = await addDoc(documentsCollectionRef, {
    ...fullDocData,
    uploadDate: Timestamp.fromDate(new Date(docData.uploadDate)),
    ...(docData.expiryDate && { expiryDate: Timestamp.fromDate(new Date(docData.expiryDate)) })
  });
  return { id: docRef.id, ...fullDocData };
};

export const updateCompanyDocument = async (tenantId: string, { id, data }: {id: string, data: Partial<NewCompanyDocumentData>}): Promise<void> => {
  if (!db) throw new Error("Firebase is not properly configured.");
  const documentDoc = doc(db, 'companyDocuments', id);
  // Security check can be added here
  const dataToUpdate: any = {...data};
  if(data.uploadDate) dataToUpdate.uploadDate = Timestamp.fromDate(new Date(data.uploadDate));
  if(data.expiryDate) dataToUpdate.expiryDate = Timestamp.fromDate(new Date(data.expiryDate));

  await updateDoc(documentDoc, dataToUpdate);
};

export const deleteCompanyDocument = async (tenantId: string, docId: string): Promise<void> => {
  if (!db) throw new Error("Firebase is not properly configured.");
  const documentDoc = doc(db, 'companyDocuments', docId);
  const docSnap = await getDoc(documentDoc);
  if (!docSnap.exists() || docSnap.data().tenantId !== tenantId) {
      throw new Error("Permission denied or document not found.");
  }
  await deleteDoc(documentDoc);
};