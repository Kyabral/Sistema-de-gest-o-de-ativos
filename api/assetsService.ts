import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  orderBy,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { Asset, NewAssetData, MaintenanceRecord, AssetDocument } from '../types';

const assetsCollectionRef = db ? collection(db, 'assets') : null;

// ... (conversion helpers remain the same)
const convertDocumentsToFirestore = (documents?: AssetDocument[]) => {
    if (!documents) return [];
    return documents.map(doc => ({
        ...doc,
        uploadDate: Timestamp.fromDate(new Date(doc.uploadDate)),
        ...(doc.expiryDate && { expiryDate: Timestamp.fromDate(new Date(doc.expiryDate)) })
    }));
};

const convertMaintenanceToFirestore = (history: MaintenanceRecord[]) => {
    return history.map(rec => ({
        ...rec,
        date: Timestamp.fromDate(new Date(rec.date)),
        approvalHistory: rec.approvalHistory.map(event => ({
            ...event,
            date: event.date ? Timestamp.fromDate(new Date(event.date)) : Timestamp.now()
        }))
    }));
};

const fromFirestore = (docSnapshot: QueryDocumentSnapshot<DocumentData>): Asset => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    tenantId: data.tenantId,
    name: data.name,
    type: data.type,
    location: data.location,
    purchaseDate: (data.purchaseDate as Timestamp)?.toDate().toISOString().split('T')[0] || '',
    expirationDate: (data.expirationDate as Timestamp)?.toDate().toISOString().split('T')[0] || '',
    purchaseValue: data.purchaseValue,
    status: data.status,
    supplierId: data.supplierId,
    maintenanceHistory: data.maintenanceHistory?.map((rec: any) => ({
        ...rec,
        date: (rec.date as Timestamp)?.toDate().toISOString().split('T')[0],
        approvalHistory: rec.approvalHistory?.map((event: any) => ({
            ...event,
            date: (event.date as Timestamp)?.toDate().toISOString()
        })) || []
    })) || [],
    documents: data.documents?.map((docData: any) => ({
        ...docData,
        uploadDate: (docData.uploadDate as Timestamp)?.toDate().toISOString().split('T')[0],
        ...(docData.expiryDate && { expiryDate: (docData.expiryDate as Timestamp).toDate().toISOString().split('T')[0] })
    })) || [],
    components: data.components || [],
    healthScore: data.healthScore,
    images: data.images || [],
    serialNumber: data.serialNumber,
    vehiclePlate: data.vehiclePlate,
    vehicleRenavam: data.vehicleRenavam,
    coordinates: data.coordinates,
    isConsumable: data.isConsumable,
    quantity: data.quantity,
    reorderLevel: data.reorderLevel,
    sku: data.sku,
  } as Asset;
};

export const getAssets = async (tenantId: string): Promise<Asset[]> => {
  if (!assetsCollectionRef) {
    console.error("Firebase is not properly configured. assetsCollectionRef is null.");
    return [];
  }
  const q = query(assetsCollectionRef, where("tenantId", "==", tenantId));
  const snapshot = await getDocs(q);
  const assets = snapshot.docs.map(fromFirestore);
  // Sort on the client-side to avoid composite index requirement
  return assets.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
};

export const addAsset = async (tenantId: string, assetData: Omit<NewAssetData, 'tenantId'>): Promise<Asset> => {
  if (!assetsCollectionRef) {
    throw new Error("Firebase is not properly configured. assetsCollectionRef is null.");
  }
  const fullAssetData: NewAssetData = { ...assetData, tenantId };

  const docRef = await addDoc(assetsCollectionRef, {
      ...fullAssetData,
      purchaseDate: Timestamp.fromDate(new Date(assetData.purchaseDate)),
      expirationDate: Timestamp.fromDate(new Date(assetData.expirationDate)),
      purchaseValue: Number(assetData.purchaseValue),
      maintenanceHistory: [],
      documents: convertDocumentsToFirestore(assetData.documents),
      components: assetData.components || [],
  });
  const newAssetSnapshot = await getDoc(docRef);
  return fromFirestore(newAssetSnapshot as QueryDocumentSnapshot<DocumentData>);
};

export const updateAsset = async (tenantId: string, asset: Asset): Promise<void> => {
  if (!db) throw new Error("Firebase is not properly configured. db is null.");
  if (asset.tenantId !== tenantId) throw new Error("Permission denied: Asset does not belong to the current tenant.");
  
  const assetDoc = doc(db, 'assets', asset.id);
  const dataToUpdate = {
      ...asset,
      purchaseDate: Timestamp.fromDate(new Date(asset.purchaseDate)),
      expirationDate: Timestamp.fromDate(new Date(asset.expirationDate)),
      maintenanceHistory: convertMaintenanceToFirestore(asset.maintenanceHistory),
      documents: convertDocumentsToFirestore(asset.documents),
      components: asset.components || [],
  };
  delete (dataToUpdate as any).id;
  await updateDoc(assetDoc, dataToUpdate as any);
};

export const deleteAsset = async (tenantId: string, assetId: string): Promise<void> => {
   if (!db) throw new Error("Firebase is not properly configured. db is null.");

   // For security, we must verify the asset belongs to the tenant before deleting.
   const assetDoc = doc(db, 'assets', assetId);
   const assetSnapshot = await getDoc(assetDoc);
   if (!assetSnapshot.exists() || assetSnapshot.data().tenantId !== tenantId) {
       throw new Error("Permission denied or asset not found.");
   }

  await deleteDoc(assetDoc);
};