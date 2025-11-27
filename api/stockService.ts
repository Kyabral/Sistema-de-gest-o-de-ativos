
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
  where,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { StockItem, NewStockItemData, StockCount, NewStockCountData, MovementType, StockMovement, StockBatch, ReconciliationItem } from '../types';

const stockCollectionRef = db ? collection(db, 'stock') : null;
const stockCountsCollectionRef = db ? collection(db, 'stockCounts') : null;

// --- Stock Items ---

const fromFirestore = (docSnapshot: QueryDocumentSnapshot<DocumentData> | DocumentData): StockItem => {
  const data = 'data' in docSnapshot ? docSnapshot.data() : docSnapshot;
  return {
    id: 'id' in docSnapshot ? docSnapshot.id : '',
    name: data.name,
    sku: data.sku,
    quantity: data.quantity,
    location: data.location,
    threshold: data.threshold,
    tenantId: data.tenantId,
    lastUpdated: (data.lastUpdated as Timestamp)?.toDate().toISOString(),
    lotNumber: data.lotNumber,
    expiryDate: data.expiryDate,
    batches: data.batches || [], // Rule 2.3.2: Batches support
    movementHistory: data.movementHistory || [], // Ensure history exists
  };
};

export const getStockItems = async (tenantId: string): Promise<StockItem[]> => {
  if (!stockCollectionRef) throw new Error("Firebase is not properly configured.");
  const q = query(stockCollectionRef, where("tenantId", "==", tenantId));
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map(fromFirestore);
  return items.sort((a, b) => a.name.localeCompare(b.name));
};

export const addStockItem = async (tenantId: string, itemData: Omit<NewStockItemData, 'tenantId'>): Promise<StockItem> => {
  if (!stockCollectionRef) throw new Error("Firebase is not properly configured.");
  
  // Initial movement log
  const initialMovement: StockMovement = {
      id: `mov_${Date.now()}`,
      date: new Date().toISOString(),
      type: 'ENTRADA',
      quantity: itemData.quantity,
      user: 'Sistema',
      reason: 'Cadastro inicial'
  };

  // Create initial batch if lot info provided
  const initialBatch: StockBatch[] = [];
  if (itemData.initialBatch) {
      initialBatch.push({
          id: `batch_${Date.now()}`,
          lotNumber: itemData.initialBatch.lotNumber,
          expiryDate: itemData.initialBatch.expiryDate,
          quantity: itemData.quantity,
          entryDate: new Date().toISOString()
      });
  } else {
      // Default batch for tracking if no specific lot provided
      initialBatch.push({
          id: `batch_${Date.now()}`,
          lotNumber: 'DEFAULT',
          expiryDate: '2099-12-31',
          quantity: itemData.quantity,
          entryDate: new Date().toISOString()
      });
  }

  // Clean up data object for Firestore (remove frontend-specific helpers)
  const { initialBatch: _, ...coreData } = itemData;

  const docRef = await addDoc(stockCollectionRef, {
    ...coreData,
    tenantId,
    lastUpdated: serverTimestamp(),
    batches: initialBatch,
    movementHistory: [initialMovement]
  });
  
  return {
    ...coreData,
    tenantId,
    id: docRef.id,
    lastUpdated: new Date().toISOString(),
    batches: initialBatch,
    movementHistory: [initialMovement]
  };
};

export const updateStockItem = async (tenantId: string, { id, data }: {id: string, data: Partial<NewStockItemData>}): Promise<void> => {
  if (!db) throw new Error("Firebase is not properly configured.");
  const itemDoc = doc(db, 'stock', id);
  // Security check can be added here in a real app or rely on Firestore rules
  await updateDoc(itemDoc, {
    ...data,
    lastUpdated: serverTimestamp(),
  });
};

// Check for active inventory (Rule 2.3.3)
const hasActiveInventory = async (tenantId: string): Promise<boolean> => {
    if (!stockCountsCollectionRef) return false;
    const q = query(
        stockCountsCollectionRef, 
        where("tenantId", "==", tenantId),
        where("status", "==", "Em Andamento")
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
};

// RULE 2.3.1 & 2.3.2: Movement Logic (Entries, Exits, Transfers, FIFO, Expiry)
export const registerStockMovement = async (
    tenantId: string, 
    itemId: string, 
    type: MovementType, 
    quantity: number, 
    user: string,
    destination?: string
): Promise<StockItem> => {
    if (!db) throw new Error("Firebase is not properly configured.");
    
    // Rule 2.3.3: Block if Inventory in progress
    const inventoryActive = await hasActiveInventory(tenantId);
    if (inventoryActive) {
        throw new Error("Regra 2.3.3: Movimentações bloqueadas durante Inventário.");
    }

    const itemDoc = doc(db, 'stock', itemId);
    const docSnap = await getDoc(itemDoc);
    
    if (!docSnap.exists()) throw new Error("Item not found.");
    
    const currentItem = fromFirestore(docSnap);
    if (currentItem.tenantId !== tenantId) throw new Error("Permission denied.");

    let newQuantity = currentItem.quantity;
    let updatedBatches = [...(currentItem.batches || [])];
    let affectedBatchIds: string[] = [];

    const todayStr = new Date().toISOString().split('T')[0];
    
    if (type === 'ENTRADA') {
        newQuantity += quantity;
        
        // Simplification: Add to latest batch or create default
        // In a full implementation, the UI would pass specific Batch ID or Data
        if (updatedBatches.length > 0) {
             // Add to most recent batch (Last In)
             updatedBatches[updatedBatches.length - 1].quantity += quantity;
             affectedBatchIds.push(updatedBatches[updatedBatches.length - 1].id);
        } else {
             const newBatch = {
                 id: `batch_${Date.now()}`,
                 lotNumber: 'LOTE-AUTO',
                 expiryDate: '2099-12-31',
                 quantity: quantity,
                 entryDate: new Date().toISOString()
             };
             updatedBatches.push(newBatch);
             affectedBatchIds.push(newBatch.id);
        }

    } else {
        // SAIDA or TRANSFERENCIA
        
        // Rule 2.3.1.1: Prevent negative stock (Global Check)
        if (currentItem.quantity < quantity) {
            throw new Error(`Operação negada: Estoque insuficiente. Disponível: ${currentItem.quantity}, Solicitado: ${quantity}`);
        }

        // Rule 2.3.2: FIFO / FEFO (First Expired, First Out)
        // Sort batches by Expiry Date (Ascending) so we consume items expiring soonest first.
        updatedBatches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

        let remainingQtyToRemove = quantity;
        
        for (const batch of updatedBatches) {
            if (remainingQtyToRemove <= 0) break;

            // Rule 2.3.2: Validity Check
            // If the batch is expired, we cannot consume it for standard Sales/Transfers.
            // Note: Typically, expired items require a specific "Baixa por Validade" process.
            if (batch.expiryDate < todayStr) {
                continue; 
            }

            if (batch.quantity > 0) {
                const amountToTake = Math.min(batch.quantity, remainingQtyToRemove);
                batch.quantity -= amountToTake;
                remainingQtyToRemove -= amountToTake;
                affectedBatchIds.push(batch.id);
            }
        }

        // Validation: Ensure we actually found enough VALID stock
        if (remainingQtyToRemove > 0) {
            throw new Error(`Operação negada: Não há estoque válido suficiente. O sistema prioriza lotes não vencidos (FIFO), e o saldo restante pode estar em lotes vencidos.`);
        }

        newQuantity -= quantity;
    }

    // Rule 2.3.1.2: Audit Log
    const movement: StockMovement = {
        id: `mov_${Date.now()}`,
        date: new Date().toISOString(),
        type,
        quantity,
        user,
        origin: type === 'TRANSFERENCIA' ? currentItem.location : undefined, // Rule 2.3.1.3
        destination: type === 'TRANSFERENCIA' ? destination : undefined,   // Rule 2.3.1.3
        batchesAffected: affectedBatchIds
    };

    const updatedHistory = [...currentItem.movementHistory, movement];
    
    const updates: any = {
        quantity: newQuantity,
        batches: updatedBatches.filter(b => b.quantity > 0), // Cleanup empty batches to keep document size manageable
        movementHistory: updatedHistory,
        lastUpdated: serverTimestamp()
    };

    if (type === 'TRANSFERENCIA' && destination) {
        updates.location = destination; // Update actual location on transfer
    }

    await updateDoc(itemDoc, updates);

    return {
        ...currentItem,
        quantity: newQuantity,
        location: type === 'TRANSFERENCIA' && destination ? destination : currentItem.location,
        batches: updatedBatches.filter(b => b.quantity > 0),
        movementHistory: updatedHistory,
        lastUpdated: new Date().toISOString()
    };
};

export const deleteStockItem = async (tenantId: string, itemId: string): Promise<void> => {
  if (!db) throw new Error("Firebase is not properly configured.");
  // Security check needed
  const itemDoc = doc(db, 'stock', itemId);
  await deleteDoc(itemDoc);
};

// --- Stock Counts ---

const fromStockCountFirestore = (docSnapshot: QueryDocumentSnapshot<DocumentData>): StockCount => {
    const data = docSnapshot.data();
    return {
        id: docSnapshot.id,
        tenantId: data.tenantId,
        date: (data.date as Timestamp)?.toDate().toISOString(),
        countedBy: data.countedBy,
        items: data.items || [],
        status: data.status,
    } as StockCount;
};

export const getStockCounts = async (tenantId: string): Promise<StockCount[]> => {
    if (!stockCountsCollectionRef) throw new Error("Firebase is not properly configured.");
    const q = query(stockCountsCollectionRef, where("tenantId", "==", tenantId));
    const snapshot = await getDocs(q);
    const counts = snapshot.docs.map(fromStockCountFirestore);
    return counts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addStockCount = async (tenantId: string, countData: Omit<NewStockCountData, 'tenantId'>): Promise<StockCount> => {
    if (!stockCountsCollectionRef) throw new Error("Firebase is not properly configured.");
    const docRef = await addDoc(stockCountsCollectionRef, {
        ...countData,
        tenantId,
        date: Timestamp.fromDate(new Date(countData.date)),
    });
    return {
        id: docRef.id,
        tenantId,
        ...countData,
    };
};

export const reconcileStock = async (tenantId: string, countId: string, user: string): Promise<void> => {
    if (!db) throw new Error("Firebase is not properly configured.");

    const countDocRef = doc(db, 'stockCounts', countId);
    const countSnap = await getDoc(countDocRef);

    if (!countSnap.exists() || countSnap.data().tenantId !== tenantId) {
        throw new Error("Contagem de estoque não encontrada ou permissão negada.");
    }
    if (countSnap.data().status === 'Finalizado') {
        throw new Error("Esta contagem já foi finalizada e reconciliada.");
    }

    const countedItems: ReconciliationItem[] = countSnap.data().items;
    const batch = writeBatch(db);

    for (const countedItem of countedItems) {
        const itemDocRef = doc(db, 'stock', countedItem.stockItemId);
        const itemSnap = await getDoc(itemDocRef);

        if (itemSnap.exists()) {
            const systemItem = fromFirestore(itemSnap.data());
            const systemQuantity = systemItem.quantity;
            const variance = countedItem.countedQuantity - systemQuantity;

            if (variance !== 0) {
                const movementType: MovementType = variance > 0 ? 'AJUSTE_ENTRADA' : 'AJUSTE_SAIDA';
                const movement: StockMovement = {
                    id: `mov_${Date.now()}`,
                    date: new Date().toISOString(),
                    type: movementType,
                    quantity: Math.abs(variance),
                    user: user,
                    reason: `Ajuste de inventário (Contagem #${countId})`,
                };

                const updatedHistory = [...systemItem.movementHistory, movement];
                const newQuantity = systemQuantity + variance;

                batch.update(itemDocRef, {
                    quantity: newQuantity,
                    movementHistory: updatedHistory,
                    lastUpdated: serverTimestamp(),
                });
            }
        }
    }

    batch.update(countDocRef, { status: 'Finalizado' });

    await batch.commit();
};
