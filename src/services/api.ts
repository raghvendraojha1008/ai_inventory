import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  writeBatch,
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Helper for generic CRUD
const crud = (col: string) => ({
    getAll: async (uid: string) => getDocs(collection(db, `users/${uid}/${col}`)),
    add: async (uid: string, data: any) => addDoc(collection(db, `users/${uid}/${col}`), data),
    update: async (uid: string, id: string, data: any) => updateDoc(doc(db, `users/${uid}/${col}`, id), data),
    delete: async (uid: string, id: string) => deleteDoc(doc(db, `users/${uid}/${col}`, id)),
});

export const ApiService = {
  // --- GENERIC METHODS (Used by new code) ---
  getAll: async (uid: string, col: string, constraints: any[] = []) => {
      const q = query(collection(db, `users/${uid}/${col}`), ...constraints);
      return await getDocs(q);
  },
  
  add: async (uid: string, col: string, data: any) => {
      return await addDoc(collection(db, `users/${uid}/${col}`), data);
  },

  update: async (uid: string, col: string, id: string, data: any) => {
      return await updateDoc(doc(db, `users/${uid}/${col}`, id), data);
  },

  delete: async (uid: string, col: string, id: string) => {
      return await deleteDoc(doc(db, `users/${uid}/${col}`, id));
  },

  // --- MISSING PAGINATION & BATCH ---
  fetchPaginated: async (uid: string, col: string, constraints: any[] = [], lastDoc: any = null) => {
      let q = query(collection(db, `users/${uid}/${col}`), ...constraints, limit(20));
      if (lastDoc) q = query(q, startAfter(lastDoc));
      return await getDocs(q);
  },

  batchAdd: async (uid: string, items: any[]) => {
      const batch = writeBatch(db);
      items.forEach(item => {
          const { _collection, ...data } = item;
          if (_collection) {
              const ref = doc(collection(db, `users/${uid}/${_collection}`));
              batch.set(ref, data);
          }
      });
      return await batch.commit();
  },

  // --- LEGACY NESTED OBJECTS (Restoring backward compatibility) ---
  settings: {
      get: async (uid: string) => {
          const snap = await getDoc(doc(db, `users/${uid}/settings`, 'config'));
          return snap.exists() ? snap.data() : null;
      },
      save: async (uid: string, data: any) => {
          return await setDoc(doc(db, `users/${uid}/settings`, 'config'), data, { merge: true });
      }
  },

  // Direct Update helper for SettingsView
  updateSettings: async (uid: string, settings: any) => {
      return await setDoc(doc(db, `users/${uid}/settings`, 'config'), settings, { merge: true });
  },

  // Legacy Section Helpers (Fixes "Property 'ledger' does not exist")
  ledger: crud('ledger_entries'),
  parties: crud('parties'),
  transactions: crud('transactions'),
  inventory: crud('inventory'),
  vehicles: crud('vehicles'),
  expenses: crud('expenses')
};
