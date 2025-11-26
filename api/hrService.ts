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
import { Employee } from '../types';

const employeesCollectionRef = db ? collection(db, 'employees') : null;

const fromFirestore = (docSnapshot: QueryDocumentSnapshot<DocumentData>): Employee => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    tenantId: data.tenantId,
    name: data.name,
    role: data.role,
    department: data.department,
    email: data.email,
    admissionDate: (data.admissionDate as Timestamp)?.toDate().toISOString().split('T')[0],
    salary: data.salary,
    status: data.status,
    avatarUrl: data.avatarUrl,
  };
};

export const getEmployees = async (tenantId: string): Promise<Employee[]> => {
  if (!employeesCollectionRef) throw new Error("Firebase not configured");
  const q = query(employeesCollectionRef, where("tenantId", "==", tenantId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(fromFirestore);
};

export const addEmployee = async (tenantId: string, empData: Omit<Employee, 'id' | 'tenantId'>): Promise<Employee> => {
  if (!employeesCollectionRef) throw new Error("Firebase not configured");
  const docRef = await addDoc(employeesCollectionRef, {
    ...empData,
    tenantId,
    admissionDate: Timestamp.fromDate(new Date(empData.admissionDate)),
  });
  return { id: docRef.id, tenantId, ...empData };
};

export const updateEmployee = async (tenantId: string, emp: Employee): Promise<void> => {
    if (!db) throw new Error("Firebase not configured");
    const docRef = doc(db, 'employees', emp.id);
    await updateDoc(docRef, {
      ...emp,
      admissionDate: Timestamp.fromDate(new Date(emp.admissionDate)),
    });
};

export const deleteEmployee = async (tenantId: string, empId: string): Promise<void> => {
    if (!db) throw new Error("Firebase not configured");
    const docRef = doc(db, 'employees', empId);
    await deleteDoc(docRef);
};
