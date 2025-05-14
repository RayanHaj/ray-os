import { indexedDbWrapper } from './idbWrapper';
import type {
  AddElement,
  GetAllElements,
  GetElement,
  RemoveElement,
} from '@/types/indexedDatabase/crudTypes';
import type { ObjectStoreIndex } from '@/types/indexedDatabase/ObjectStoreIndex';
import type { ObjectStore } from '@/types/indexedDatabase/ObjectStore';

export class IdbWrapperService {
  private _db!: IDBDatabase;
  private _get!: GetElement;
  private _add!: AddElement;
  private _remove!: RemoveElement;
  private _getAll!: GetAllElements;

  private _createObjectStore!: (
    name: string,
    keyPath: string | string[],
    autoIncrement?: boolean | undefined,
  ) => {
    createIndexes: ((indexes: ObjectStoreIndex[]) => void) | null;
    error: string | Error | null;
  };

  static async create(
    name: string,
    version: number,
    objectStores: ObjectStore[],
  ): Promise<IdbWrapperService> {
    const service = new IdbWrapperService();
    await service.init(name, version, objectStores);
    return service;
  }

  private async init(
    name: string,
    version: number,
    objectStores: ObjectStore[],
  ): Promise<void | DOMException> {
    return new Promise((resolve, reject) => {
      indexedDbWrapper(name, version, {
        onUpgrade: (db, { createObjectStore }) => {
          this.createObjectStore = createObjectStore;
          objectStores.forEach((store) => {
            if (!db.objectStoreNames.contains(store.name)) {
              const objectStore = createObjectStore(store.name, store.keyPath, store.autoIncrement);
              if (objectStore && objectStore.createIndexes) {
                objectStore.createIndexes(store.indexes);
              }
            }
          });
        },
        onSuccess: (db, { get, add, remove, getAll }) => {
          this._db = db;
          this._get = get;
          this._add = add;
          this._remove = remove;
          this._getAll = getAll;
          resolve();
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  }

  public async getElement<T extends object>(
    storeName: string,
    indexName: string,
    value: IDBValidKey,
  ) {
    return await this._get<T>(storeName, indexName, value);
  }

  public async addElement<T extends object>(storeName: string, element: T) {
    return await this._add(storeName, element);
  }

  public async removeElement(
    storeName: string,
    element: IDBValidKey,
    options?: {
      searchIndex: { value: string; returnType: { id: IDBValidKey } };
    },
  ) {
    return await this._remove(storeName, element, options);
  }

  public async getAllElements(storeName: string) {
    return await this._getAll(storeName);
  }

  public getDb() {
    return this._db;
  }

  public createObjectStore(
    name: string,
    keyPath: string | string[],
    autoIncrement?: boolean | undefined,
  ): {
    createIndexes: ((indexes: ObjectStoreIndex[]) => void) | null;
    error: string | Error | null;
  } {
    return this._createObjectStore(name, keyPath, autoIncrement);
  }
}
