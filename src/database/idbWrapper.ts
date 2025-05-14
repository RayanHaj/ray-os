import type { ObjectStoreIndex } from '@/types/indexedDatabase/ObjectStoreIndex';
import type {
  AddElement,
  RemoveElement,
  GetAllElements,
  GetElement,
} from '@/types/indexedDatabase/crudTypes';
import type { OnUpgradeActions } from '@/types/indexedDatabase/ActionsOnUpgrade';
import type { OnSuccessActions } from '@/types/indexedDatabase/ActionsOnSuccess';

export function indexedDbWrapper(
  name: string,
  version: number,
  {
    onUpgrade,
    onSuccess,
    onError,
  }: {
    onUpgrade?: (db: IDBDatabase, actions: OnUpgradeActions) => void;
    onSuccess?: (db: IDBDatabase, actions: OnSuccessActions) => void;
    onError?: (error: DOMException) => void;
  },
) {
  const request = indexedDB.open(name, version ?? 1);

  request.onupgradeneeded = () => {
    const db = request.result;
    onUpgrade?.(db, {
      createObjectStore: createObjectStore.bind(null, db),
    });
  };

  request.onsuccess = () => {
    const db = request.result;
    const add = addElement.bind(null, db);
    const get = getElement.bind(null, db);
    const getAll = getAllElements.bind(null, db);
    const remove = deleteElement.bind(null, db);

    onSuccess?.(db, {
      add: add as AddElement,
      get: get as GetElement,
      getAll: getAll as GetAllElements,
      remove: remove as RemoveElement,
    });
  };

  request.onerror = (event) => {
    const error = (event.target as IDBRequest).error;
    onError?.(error!);
  };

  function createObjectStore(
    db: IDBDatabase,
    name: string,
    keyPath: string | string[],
    autoIncrement?: boolean,
  ) {
    let createIndexes: ((indexes: ObjectStoreIndex[]) => void) | null = null;
    let error: Error | string | null = null;
    try {
      const objectStore = db.createObjectStore(name, {
        keyPath: keyPath,
        autoIncrement: autoIncrement ?? false,
      });

      createIndexes = createIndex.bind(null, objectStore);
    } catch (e) {
      if (e instanceof Error) {
        error = e;
      } else {
        error = `unexpected error: ${error}`;
      }
    }

    return { createIndexes, error };
  }

  function createIndex(objectStore: IDBObjectStore, indexes: ObjectStoreIndex[]) {
    indexes.forEach((index) => {
      objectStore.createIndex(index.indexName, index.keyPath, { unique: index.unique });
    });
  }

  function addElement(
    db: IDBDatabase,
    storeName: string,
    element: object,
  ): Promise<IDBValidKey | DOMException | null> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(element);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  function getElement<T>(
    db: IDBDatabase,
    storeName: string,
    indexName: string,
    element: IDBValidKey,
  ): Promise<T | undefined> {
    return new Promise<T | undefined>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.get(element);

      request.onsuccess = () => {
        resolve(request.result as T | undefined);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  function getAllElements<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as T[]);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  function deleteElement<R extends { id: IDBValidKey } & Record<string, unknown>>(
    db: IDBDatabase,
    storeName: string,
    element: IDBValidKey,
    options?: { searchIndex: { value: string; returnType: R } },
  ): Promise<IDBValidKey | DOMException | null> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const index = options?.searchIndex?.value;
      if (index) {
        getElement<R>(db, storeName, index, element)
          .then((value) => {
            if (!value) return resolve(null);

            const keyToDelete = value.id ?? value[options.searchIndex.value];
            if (!keyToDelete) return resolve(null);

            const request = store.delete(keyToDelete);
            request.onsuccess = () => {
              resolve(request.result ?? null);
            };
            request.onerror = () => {
              reject(request.error);
            };
          })
          .catch((reason) => {
            reject(reason);
          });
        return;
      }

      const request = store.delete(element);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  }
}
