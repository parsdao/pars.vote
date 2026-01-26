/**
 * IndexedDB utilities for caching larger data that doesn't fit in localStorage
 */

import { useCallback } from 'react';

const DB_NAME = 'cyrus_dao_cache';
const DB_VERSION = 1;

export enum DBObjectKeys {
  DECODED_TRANSACTIONS = 'decoded_transactions',
  PROPOSAL_METADATA = 'proposal_metadata',
  SAFE_DATA = 'safe_data',
}

let dbInstance: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores for each DBObjectKey
      Object.values(DBObjectKeys).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      });
    };
  });
};

export const useIndexedDB = (
  storeName: DBObjectKeys,
): [(key: string, value: unknown) => Promise<void>, (key: string) => Promise<unknown>] => {
  const setValue = useCallback(
    async (key: string, value: unknown): Promise<void> => {
      try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.put(value, key);

          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });
      } catch {
        // IndexedDB not available, ignore
      }
    },
    [storeName],
  );

  const getValue = useCallback(
    async (key: string): Promise<unknown> => {
      try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.get(key);

          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        });
      } catch {
        return null;
      }
    },
    [storeName],
  );

  return [setValue, getValue];
};

export const clearIndexedDB = async (): Promise<void> => {
  try {
    const db = await openDB();
    Object.values(DBObjectKeys).forEach((storeName) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      store.clear();
    });
  } catch {
    // Ignore errors
  }
};
