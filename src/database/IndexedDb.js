export default class IndexedDb {
    constructor(name, version) {
        this.db = null;
        this.name = name;
        this.version = version;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const openRequest = indexedDB.open(this.name, this.version);

            openRequest.onsuccess = event => {
                this.db = event.target.result;

                resolve(this.db); // Resolve when DB is successfully opened
            };

            openRequest.onupgradeneeded = event => {
                this.db = event.target.result;

                if (!this.db.objectStoreNames.contains('videos')) {
                    const store = this.db.createObjectStore('videos', { keyPath: 'name' });
                    store.createIndex('name', 'name');
                    store.createIndex('type', 'type');
                }
            };

            openRequest.onerror = event => {
                reject(event.target.error); // Reject on error
            };
        });
    }


    async getAllElements(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const elements = [];

            transaction.onerror = event => reject(event.target.error);

            store.openCursor().onsuccess = e => {
                let cursor = e.target.result;
                if (cursor) {
                    elements.push(cursor.value)
                    cursor.continue();
                } else {
                    resolve(elements);
                }
            };
        });
    }

    async postElement(storeName, element) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);

            transaction.oncomplete = () => resolve();
            transaction.onerror = event => reject(event.target.error);

            store.add(element);
        });
    }

    async removeElement(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);

            transaction.oncomplete = () => resolve();
            transaction.onerror = event => reject(event.target.error);

            store.delete(id);
        });
    }
}