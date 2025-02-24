import json from "@/assets/json/config.json";
import { parseApplicationNameToImageNameFormat } from "@/utils/util";

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

                resolve(this.db);
            };

            openRequest.onupgradeneeded = async event => {
                this.db = event.target.result;

                if (!this.db.objectStoreNames.contains('files')) {
                    const store = this.db.createObjectStore('files', {keyPath: 'name', autoIncrement: true});
                    store.createIndex('name', 'name');
                    store.createIndex('type', 'type');
                    store.createIndex('createdAt', 'createdAt');
                    store.createIndex('gridIndex', 'gridIndex');
                    store.createIndex('image', 'image');
                    store.createIndex('file', 'file');
                }

                if (!this.db.objectStoreNames.contains('desktopFiles')) {
                    const store = this.db.createObjectStore('desktopFiles', {keyPath: 'name', autoIncrement: true});
                    store.createIndex('name', 'name');
                    store.createIndex('type', 'type');
                    store.createIndex('createdAt', 'createdAt');
                    store.createIndex('gridIndex', 'gridIndex');
                    store.createIndex('image', 'image');
                    store.createIndex('file', 'file');
                }

                if (!this.db.objectStoreNames.contains('taskbarFiles')) {
                    const store = this.db.createObjectStore('taskbarFiles', {keyPath: 'name', autoIncrement: true});
                    store.createIndex('name', 'name');
                    store.createIndex('type', 'type');
                    store.createIndex('createdAt', 'createdAt');
                    store.createIndex('gridIndex', 'gridIndex');
                    store.createIndex('image', 'image');
                    store.createIndex('file', 'file');
                }

                if (!this.db.objectStoreNames.contains('fileSystem')) {
                    const store = this.db.createObjectStore('fileSystem', {keyPath: 'id', autoIncrement: true});
                    store.createIndex('directoryName', 'directoryName');
                    store.createIndex('parentDirectories', 'parentDirectories');
                    store.createIndex('children', 'children');
                }

                const transaction = event.target.transaction;
                transaction.oncomplete = async () => {
                    let index = -1;
                    for (let name of json.defaultApplicationNames) {
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

                                await this.postElement('files', object);
                                await this.postElement('desktopFiles', object);
                                await this.postElement('taskbarFiles', object);
                            });
                    }

                    // creates root directory
                    const rootDirectory = await this.postElement('fileSystem', {
                        directoryName: json.rootDirectory,
                        parentDirectories: [],
                        children: []
                    });

                    let defaultDirectories = [];

                    // creates default directories in the root
                    for (let name of json.initFileSystem) {
                        if (name !== 'My Files') {
                            const directory = await this.postElement('fileSystem', {
                                directoryName: name,
                                parentDirectories: [{
                                    id: rootDirectory.id,
                                    name: json.rootDirectory
                                }],
                                children: []
                            })

                            if (directory) {
                                defaultDirectories.push({
                                    id: directory.id,
                                    name: directory.directoryName
                                });
                            }
                        }
                    }

                    await this.updateElement('fileSystem', 'children', defaultDirectories, rootDirectory.id)
                        .then(error => {
                            console.error(error);
                        });
                }
            };

            openRequest.onerror = event => {
                reject(event.target.error);
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

            const request = store.add(element);

            request.onsuccess = event => {
                resolve({
                    id: event.target.result,
                    directoryName: element.directoryName
                });
            };

            transaction.onerror = event => reject(event.target.error);
            request.onerror = event => reject(event.target.error);
        });
    }

    async updateElement(storeName, key, value, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            console.log('getting id: ' + id);
            const request = store.get(id);

            request.onsuccess = event => {
                const element = event.target.result;
                if (element) {
                    element[key] = value;
                    const updateRequest = store.put(element);
                    updateRequest.onsuccess = () => resolve();
                    updateRequest.onerror = event => reject(event.target.error);
                }
            }

            request.onerror = event => reject(event.target.error);
            transaction.onerror = event => reject(event.target.error);
        });
    }

    async getElementByType(storeName, type) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index('type');

            const request = index.getAll(type);

            request.onsuccess = event => {
                resolve(event.target.result);
            }

            request.onerror = event => {
                reject(event.target.error);
            }
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

    async getImageByFileType(filetype) {
        switch (filetype) {
            case 'video/mp4': {
                const object = await this.getElementByName('files', 'Video Player');
                return object.image;
            }
        }
    }

    async getFilesByDirectoryFromFileSystem(directory) {
        const transaction = this.db.transaction(['fileSystem'], 'readonly');
        const store = transaction.objectStore('fileSystem');
        const index = store.index('parentDirectories');

        return new Promise((resolve, reject) => {
            const openCursor = index.openCursor();

            let returnArray = [];
            openCursor.onsuccess = (event) => {
                const cursor = event.target.result;

                if (cursor) {
                    if (cursor.value.parentDirectories.includes(directory)) {
                        returnArray.push(cursor.value);
                    }
                    cursor.continue();
                } else {
                    resolve(returnArray);
                }
            };

            openCursor.onerror = (event) => {
                reject('Error occurred while accessing cursor: ' + event.target.error);
            };
        });
    }

    async getDirectoriesByNameFileSystem(name) {
        const transaction = this.db.transaction(['fileSystem'], 'readonly');
        const store = transaction.objectStore('fileSystem');
        const index = store.index('directoryName');

        return new Promise((resolve, reject) => {
            const openCursor = index.openCursor();

            let returnArray = [];
            openCursor.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.directoryName === name) {
                        returnArray.push(cursor.value);
                    }
                    cursor.continue();
                } else {
                    resolve(returnArray);
                }
            }

            openCursor.onerror = (event) => {
                reject('Error occurred while accessing cursor: ' + event.target.error);
            }
        });
    }

    async getDirectoryById(id) {
        if (!id) return;

        const transaction = this.db.transaction(['fileSystem'], 'readonly');
        const store = transaction.objectStore('fileSystem');

        return new Promise((resolve, reject) => {
            const request = store.get(id);  // Use the store's .get() method to retrieve by key

            request.onsuccess = (event) => {
                resolve(event.target.result); // Return the object corresponding to the id
            };

            request.onerror = (event) => {
                reject('Error occurred while accessing the object: ' + event.target.error);
            };
        });
    }

}