
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
  DocumentData,
  QueryDocumentSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { Expense, NewExpenseData, ExpenseStatus } from '../types';

const expensesCollectionRef = db ? collection(db, 'expenses') : null;

const fromFirestore = (docSnapshot: QueryDocumentSnapshot<DocumentData>): Expense => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    tenantId: data.tenantId,
    description: data.description,
    supplierId: data.supplierId,
    category: data.category,
    issueDate: (data.issueDate as Timestamp)?.toDate().toISOString().split('T')[0],
    dueDate: (data.dueDate as Timestamp)?.toDate().toISOString().split('T')[0],
    totalValue: data.totalValue,
    amountPaid: data.amountPaid,
    remainingValue: data.remainingValue,
    status: data.status,
    paymentMethod: data.paymentMethod,
    isReconciled: data.isReconciled,
    groupId: data.groupId,
    installmentNumber: data.installmentNumber,
    totalInstallments: data.totalInstallments,
    paymentHistory: data.paymentHistory?.map((ph: any) => ({
        ...ph,
        date: (ph.date as Timestamp)?.toDate().toISOString()
    })) || [],
    attachmentUrl: data.attachmentUrl,
  };
};

export const getExpenses = async (tenantId: string): Promise<Expense[]> => {
  if (!expensesCollectionRef) throw new Error("Firebase not configured");
  const q = query(expensesCollectionRef, where("tenantId", "==", tenantId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(fromFirestore).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
};

// Handles Rule 4: Installments (Parcelamentos) logic
export const addExpense = async (tenantId: string, expenseData: NewExpenseData): Promise<Expense[]> => {
  if (!db || !expensesCollectionRef) throw new Error("Firebase not configured");

  const batch = writeBatch(db);
  const groupId = `group_${Date.now()}`;
  const installments = expenseData.installments || 1;
  const installmentValue = expenseData.totalValue / installments;
  const newExpenses: Expense[] = [];

  for (let i = 0; i < installments; i++) {
      const ref = doc(expensesCollectionRef);
      const dueDate = new Date(expenseData.dueDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      const expense: any = {
          tenantId,
          description: installments > 1 ? `${expenseData.description} (${i+1}/${installments})` : expenseData.description,
          supplierId: expenseData.supplierId,
          category: expenseData.category,
          issueDate: Timestamp.fromDate(new Date(expenseData.issueDate)),
          dueDate: Timestamp.fromDate(dueDate),
          totalValue: installmentValue,
          amountPaid: 0,
          remainingValue: installmentValue,
          status: ExpenseStatus.OPEN,
          isReconciled: false,
          groupId: installments > 1 ? groupId : null,
          installmentNumber: i + 1,
          totalInstallments: installments,
          paymentHistory: [],
          attachmentUrl: expenseData.attachmentUrl || null
      };

      if(expenseData.paymentMethod) {
          expense.paymentMethod = expenseData.paymentMethod;
      }

      batch.set(ref, expense);
      
      newExpenses.push({
          id: ref.id,
          ...expense,
          issueDate: expenseData.issueDate,
          dueDate: dueDate.toISOString().split('T')[0],
          paymentHistory: []
      });
  }

  await batch.commit();
  return newExpenses;
};

export const updateExpense = async (tenantId: string, expense: Expense): Promise<void> => {
    if (!db) throw new Error("Firebase not configured");
    const docRef = doc(db, 'expenses', expense.id);
    
    const dataToUpdate: any = {
        ...expense,
        issueDate: Timestamp.fromDate(new Date(expense.issueDate)),
        dueDate: Timestamp.fromDate(new Date(expense.dueDate)),
        paymentHistory: expense.paymentHistory.map(ph => ({
            ...ph,
            date: Timestamp.fromDate(new Date(ph.date))
        }))
    };
    delete dataToUpdate.id;

    await updateDoc(docRef, dataToUpdate);
};

export const deleteExpense = async (tenantId: string, expenseId: string): Promise<void> => {
    if (!db) throw new Error("Firebase not configured");
    const docRef = doc(db, 'expenses', expenseId);
    await deleteDoc(docRef);
};
