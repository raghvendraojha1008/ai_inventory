import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const DataService = {
  backupData: async (uid: string) => {
      try {
          const collections = ['ledger_entries', 'transactions', 'parties', 'vehicles', 'inventory', 'expenses', 'settings'];
          const backup: any = {};
          
          for (const col of collections) {
              const snap = await getDocs(collection(db, `users/${uid}/${col}`));
              backup[col] = snap.docs.map(d => ({ ...d.data(), _id: d.id }));
          }
          
          const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          
          return { success: true, message: "Backup Downloaded" };
      } catch (e) {
          console.error(e);
          return { success: false, message: "Backup Failed" };
      }
  }
};
