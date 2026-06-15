import { useToastStore } from '@/stores/toast.ts';
import type { RayDb } from 'ray-db-wrapper';

export async function useResetState(rayDb: RayDb, windowId?: string) {
  const dbName = rayDb.db().name;
  rayDb.close();

  const dbDeleteRequest = window.indexedDB.deleteDatabase(dbName);
  dbDeleteRequest.onerror = (_) => {
    console.error('Error deleting database.');
  };

  dbDeleteRequest.onblocked = () => {
    useToastStore().createToast(
      'Please close all other RayOS tabs before resetting',
      'error',
      5000,
      windowId ? 'window' : 'desktop',
      windowId,
    );
  };

  dbDeleteRequest.onsuccess = (_) => {
    localStorage.clear();
    location.reload();
  };
}
