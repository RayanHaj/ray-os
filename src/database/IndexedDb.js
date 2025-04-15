import json from "@/assets/json/config.json";
import {parseApplicationNameToImageNameFormat, parseFileToDbFileObject} from "@/utils/util";

export default class IndexedDb {
    constructor(name, version) {
        this.db = null;
        this.name = name;
        this.version = version;
        this.acceptedStoreNames = ['files', 'desktopFiles', 'taskbarFiles', 'fileSystem'];
        this.acceptedFileTypes = ['image/png', 'image/jpeg', 'video/mp4', 'audio/mpeg']
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
                    const store = this.db.createObjectStore('files', {keyPath: 'id', autoIncrement: true});
                    store.createIndex('id', 'id');
                    store.createIndex('name', 'name');
                    store.createIndex('type', 'type');
                    store.createIndex('createdAt', 'createdAt');
                    store.createIndex('rawFile', 'rawFile');
                }

                if (!this.db.objectStoreNames.contains('desktopFiles')) {
                    const store = this.db.createObjectStore('desktopFiles', {keyPath: 'id', autoIncrement: true});
                    store.createIndex('name', 'name');
                    store.createIndex('type', 'type');
                    store.createIndex('id', 'id');
                }

                if (!this.db.objectStoreNames.contains('taskbarFiles')) {
                    const store = this.db.createObjectStore('taskbarFiles', {keyPath: 'id', autoIncrement: true});
                    store.createIndex('name', 'name');
                    store.createIndex('type', 'type');
                    store.createIndex('id', 'id');
                }

                if (!this.db.objectStoreNames.contains('fileSystem')) {
                    const store = this.db.createObjectStore('fileSystem', {keyPath: 'id', autoIncrement: true});
                    store.createIndex('id', 'id');
                    store.createIndex('directoryName', 'directoryName');
                    store.createIndex('parentDirectories', 'parentDirectories');
                    store.createIndex('children', 'children');
                }

                const transaction = event.target.transaction;
                transaction.oncomplete = async () => {
                    for (let name of json.defaultApplicationNames) {
                        const parsedName = parseApplicationNameToImageNameFormat(name);
                        const imgPath = import(`@/assets/images/applicationImages/${parsedName}.png`);

                        fetch(imgPath)
                            .then(response => response.blob())
                            .then(async blob => {
                                const dbFileObject = parseFileToDbFileObject(name, 'Application', blob, null, false);
                                await this.postElement('files', dbFileObject);

                                if (name !== 'Video Player') {
                                    this.getAllElements('files').then(async files => {
                                        const file = files.find(file => file.name === name);

                                        if (file) {
                                            const dbFileReferenceObject = parseFileToDbFileObject(file.name, file.type, null, file.id, true);
                                            await this.postElement('desktopFiles', dbFileReferenceObject);
                                            await this.postElement('taskbarFiles', dbFileReferenceObject);
                                        }
                                    });
                                }
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
                                    type: 'directory',
                                    name: json.rootDirectory
                                }],
                                children: []
                            })

                            if (directory) {
                                defaultDirectories.push({
                                    id: directory.id,
                                    type: 'directory',
                                    name: directory.directoryName
                                });
                            }
                        }
                    }

                    await this.updateElement('fileSystem', 'children', defaultDirectories, rootDirectory.id)
                        .then(error => {
                            console.error(error);
                        });

                    this.getAllElements('files').then(files => {
                        files.forEach(file => {
                            switch (file.type) {
                                case 'video/mp4': {
                                    this.addFileToDirectory(file.id, file.name, file.type, 'Videos');
                                }
                                    break;
                                case 'Application': {
                                    this.addFileToDirectory(file.id, file.name, file.type, 'Applications');
                                }
                                    break;
                            }
                        });
                    });
                }
            };

            openRequest.onerror = event => {
                reject(event.target.error);
            };
        });
    }
    async getElement(storeName, index, identifier) {
        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readonly');
                const indexedStore = transaction.objectStore(storeName).index(index);
                const request = indexedStore.get(identifier);

                request.onsuccess = event => {
                    resolve(event.target.result);
                };

                request.onerror = event => {
                    reject(event.target.error);
                };
            })
        } catch (error) {
            console.error(`couldn't fetch element: ${error}`);
            throw error;
        }
    }
    async getAllElements(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);

            transaction.onerror = event => reject(event.target.error);

            const request = store.getAll();

            request.onsuccess = () => {
                const results = request.result;
                resolve(results);
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
    async deleteElement(storeName, identifier) {
        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const indexedStore = transaction.objectStore(storeName);
                const request = indexedStore.delete(identifier);

                request.onsuccess = () => {
                    resolve(`element with identifier of: ${identifier} successfully deleted`);
                };

                request.onerror = event => {
                    reject(event.target.error);
                };
            })
        } catch (error) {
            console.error(`couldn't delete element: ${error}`);
            throw error;
        }
    }
    async deleteDirectory(id) {
        const storeName = 'fileSystem';

        await this.recursiveChildrenDelete(id)

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = async event => {
                resolve(event.target.result);
            }

            request.onerror = event => {
                reject(event.target.error);
            }
        });
    }
    async deleteChildReverenceFromParent(id, childId) {
        return new Promise((resolve, reject) => {
            const storeName = 'fileSystem';
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const getParentRequest = store.get(id);

            getParentRequest.onsuccess(event => {
                const result = event.target.result;
                result.children = result.children.filter(child => child.id === childId);
                const putRequest = store.put(result);

                putRequest.onsuccess = () => {
                    resolve(`successfully deleted child reference: ${childId} from parent directory: ${id}`);
                }

                putRequest.onerror = event => {
                    reject(event.target.error);
                }
            });
        });
    }
    async recursiveChildrenDelete(id) {
        let children = [];

        try {
            children = await this.getDirectoryChildren(id);
        } catch (_) {
            return;
        }

        for (const child of children) {
            if (child.type === 'directory') {
                console.dir({
                    'children': child,
                    'date': (new Date).getMilliseconds()
                });
                await this.deleteDirectory(child.id)
            } else {
                console.dir({
                    'children': child,
                    'date': (new Date).getMilliseconds()
                });
                await this.deleteElement('files', child.id);
                await this.deleteElement('desktopFiles', child.id);
                await this.deleteElement('taskbarFiles', child.id);
            }
        }
    }
    async getDirectoryChildren(id) {
        const storeName = 'fileSystem';
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = event => {
                const children = event.target.result.children;
                if (!children) {
                    reject(null);
                }

                if (children.length > 0) {
                    resolve(children);
                }

                reject(null);
            }

            request.onerror = event => {
                reject(event.target.error);
            }
        });
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
    async addFileToDirectory(id, name, type, directoryName) {
        return new Promise((resolve, reject) => {
            this.getDirectoriesByNameFileSystem(directoryName).then(directories => {
                const transaction = this.db.transaction(['fileSystem'], 'readwrite');
                const store = transaction.objectStore('fileSystem');
                const request = store.get(directories[0].id);

                request.onsuccess = event => {
                    const element = event.target.result;
                    if (element) {
                        element.children.push({
                            'id': id,
                            'type': type,
                            'name': name
                        });
                        const updateRequest = store.put(element);
                        updateRequest.onsuccess = () => resolve();
                        updateRequest.onerror = event => reject(event.target.error);
                    }
                }

                request.onerror = event => reject(event.target.error);
                transaction.onerror = event => reject(event.target.error);
            });
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
}