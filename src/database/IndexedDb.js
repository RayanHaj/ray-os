import json from "@/assets/json/config.json";
import {parseApplicationNameToImageNameFormat} from "@/utils/util";
export default class IndexedDb {
    constructor(name, version) {
        this.db = null;
        this.name = name;
        this.version = version;
    }

    async init() {
        return new Promise( (resolve, reject) => {
            const openRequest = indexedDB.open(this.name, this.version);

            openRequest.onsuccess = event => {
                this.db = event.target.result;

                resolve(this.db);
            };

            openRequest.onupgradeneeded = async event => {
                this.db = event.target.result;

                if (!this.db.objectStoreNames.contains('files')) {
                    const store = this.db.createObjectStore('files', { keyPath: 'name' });
                    store.createIndex('name', 'name');
                    store.createIndex('type', 'type');
                    store.createIndex('createdAt', 'createdAt');
                    store.createIndex('gridIndex', 'gridIndex');
                    store.createIndex('image', 'image');
                    store.createIndex('file', 'file');
                }

                const transaction = event.target.transaction;
                transaction.oncomplete = () => {
                    let index = -1;
                    for(let name of json.defaultApplicationNames) {
                        const parsedName = parseApplicationNameToImageNameFormat(name);
                        const imgPath = require(`@/assets/images/applicationImages/${parsedName}.png`);

                        fetch(imgPath)
                            .then(response => response.blob())
                            .then(async blob => {
                                const object = {
                                    name: name,
                                    type: 'Application',
                                    createdAt: new Date(),
                                    gridIndex: index += 1,
                                    image: blob,
                                    file: null
                                }

                                await this.postElement('files', object)
                            });
                    }
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

    async getElementByName(storeName, name) {
        return new Promise((resolve, reject) => {
           const transaction = this.db.transaction([storeName], 'readonly');
           const store = transaction.objectStore(storeName);
           const index = store.index('name');

           const request = index.get(name);

           request.onsuccess = event => {
               resolve(event.target.result);
           }

           request.onerror = event => {
               reject(event.target.error);
           }
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