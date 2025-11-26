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
import { Project } from '../types';

const projectsCollectionRef = db ? collection(db, 'projects') : null;

const fromFirestore = (docSnapshot: QueryDocumentSnapshot<DocumentData>): Project => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    tenantId: data.tenantId,
    name: data.name,
    client: data.client,
    status: data.status,
    progress: data.progress,
    startDate: (data.startDate as Timestamp)?.toDate().toISOString().split('T')[0],
    endDate: (data.endDate as Timestamp)?.toDate().toISOString().split('T')[0],
    budget: data.budget,
    manager: data.manager,
  };
};

export const getProjects = async (tenantId: string): Promise<Project[]> => {
  if (!projectsCollectionRef) throw new Error("Firebase not configured");
  const q = query(projectsCollectionRef, where("tenantId", "==", tenantId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(fromFirestore);
};

export const addProject = async (tenantId: string, projectData: Omit<Project, 'id' | 'tenantId'>): Promise<Project> => {
  if (!projectsCollectionRef) throw new Error("Firebase not configured");
  const docRef = await addDoc(projectsCollectionRef, {
    ...projectData,
    tenantId,
    startDate: Timestamp.fromDate(new Date(projectData.startDate)),
    endDate: Timestamp.fromDate(new Date(projectData.endDate)),
  });
  return { id: docRef.id, tenantId, ...projectData };
};

export const updateProject = async (tenantId: string, project: Project): Promise<void> => {
    if (!db) throw new Error("Firebase not configured");
    const docRef = doc(db, 'projects', project.id);
    await updateDoc(docRef, {
      ...project,
      startDate: Timestamp.fromDate(new Date(project.startDate)),
      endDate: Timestamp.fromDate(new Date(project.endDate)),
    });
};

export const deleteProject = async (tenantId: string, projectId: string): Promise<void> => {
    if (!db) throw new Error("Firebase not configured");
    const docRef = doc(db, 'projects', projectId);
    await deleteDoc(docRef);
};
