export type AddElement = (
  storeName: string,
  element: object,
) => Promise<IDBValidKey | DOMException | null>;

export type GetElement = <T>(
  storeName: string,
  indexName: string,
  value: IDBValidKey,
) => Promise<T>;

export type GetAllElements = <T>(storeName: string) => Promise<T[]>;

export type RemoveElement = <R extends { id: IDBValidKey }>(
  storeName: string,
  element: IDBValidKey,
  options?: { searchIndex: { value: string; returnType: R } },
) => Promise<IDBValidKey | DOMException | null>;
