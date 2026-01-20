import { ApiService } from './api';

// Collections to backup
const BACKUP_COLLECTIONS = ['ledger_entries', 'transactions', 'inventory', 'parties', 'expenses', 'vehicles'];

export const BackupService = {
  /**
   * Export all user data to JSON file
   */
  exportToJSON: async (uid: string): Promise<boolean> => {
    try {
      const backupData: Record<string, any[]> = {};
      
      // Fetch all collections in parallel
      const results = await Promise.all(
        BACKUP_COLLECTIONS.map(async (col) => {
          const snap = await ApiService.getAll(uid, col, []);
          return {
            collection: col,
            data: snap.docs.map(d => {
              const data = d.data();
              // Convert Firestore timestamps to ISO strings
              if (data.date && data.date.toDate) {
                data.date = data.date.toDate().toISOString();
              }
              if (data.created_at && data.created_at.toDate) {
                data.created_at = data.created_at.toDate().toISOString();
              }
              return { id: d.id, ...data };
            })
          };
        })
      );

      // Also get settings
      const settings = await ApiService.settings.get(uid);
      
      results.forEach(r => {
        backupData[r.collection] = r.data;
      });
      backupData['settings'] = [settings];

      // Create and download file
      const jsonContent = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `shopkeeper_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      return true;
    } catch (error) {
      console.error('Backup export failed:', error);
      return false;
    }
  },

  /**
   * Import data from JSON backup file
   */
  importFromJSON: async (uid: string, file: File): Promise<{ success: boolean; message: string; counts?: Record<string, number> }> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const counts: Record<string, number> = {};
      
      // Process each collection
      for (const col of BACKUP_COLLECTIONS) {
        if (data[col] && Array.isArray(data[col])) {
          const records = data[col].map((item: any) => {
            // Remove id to create new docs, convert date strings back
            const { id, ...rest } = item;
            if (rest.date && typeof rest.date === 'string') {
              rest.date = new Date(rest.date);
            }
            return { collection: col, data: rest };
          });
          
          if (records.length > 0) {
            // Batch add in chunks of 500
            const chunkSize = 400;
            for (let i = 0; i < records.length; i += chunkSize) {
              const chunk = records.slice(i, i + chunkSize);
              await ApiService.batchAdd(uid, chunk);
            }
            counts[col] = records.length;
          }
        }
      }

      // Restore settings if present
      if (data['settings'] && data['settings'][0]) {
        await ApiService.settings.save(uid, data['settings'][0]);
        counts['settings'] = 1;
      }

      return {
        success: true,
        message: 'Backup restored successfully!',
        counts
      };
    } catch (error: any) {
      console.error('Backup import failed:', error);
      return {
        success: false,
        message: `Import failed: ${error.message || 'Invalid file format'}`
      };
    }
  },

  /**
   * Validate backup file structure
   */
  validateBackupFile: async (file: File): Promise<{ valid: boolean; summary?: Record<string, number>; error?: string }> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const summary: Record<string, number> = {};
      
      for (const col of BACKUP_COLLECTIONS) {
        if (data[col] && Array.isArray(data[col])) {
          summary[col] = data[col].length;
        }
      }
      
      if (data['settings']) {
        summary['settings'] = 1;
      }

      if (Object.keys(summary).length === 0) {
        return { valid: false, error: 'No valid data found in backup file' };
      }

      return { valid: true, summary };
    } catch (error: any) {
      return { valid: false, error: 'Invalid JSON file' };
    }
  }
};
