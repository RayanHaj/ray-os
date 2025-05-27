import './assets/main.css';
import themes from '@/json/themes.json';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { useThemeSwitcher } from '@/composables/useThemeSwitcher.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { RayDb } from 'ray-db-wrapper';

import App from './App.vue';
import router from './router';
import type { FileSystemItem } from '@/types/FileSystemItem.ts';
import { fileSystemLookup, insertItemIntoFileSystem } from '@/composables/useIndexedDbHelper.ts';

const app = createApp(App);

app.use(createPinia());
app.use(router);

const rayDb = await RayDb.create('desktop', 1, [
  {
    name: 'files',
    keyPath: 'id',
    indexes: [
      { indexName: 'name', keyPath: 'name', unique: true },
      { indexName: 'type', keyPath: 'type', unique: false },
    ],
    autoIncrement: true,
  },
  {
    name: 'fileSystem',
    keyPath: 'id',
    indexes: [
      { indexName: 'id', keyPath: 'id', unique: true },
      { indexName: 'parents', keyPath: 'parents', unique: false },
      { indexName: 'file', keyPath: 'file', unique: false },
      { indexName: 'directory', keyPath: 'directory', unique: false },
    ],
    autoIncrement: true,
  },
]);

const fileSystemStore = useFileSystemStore();
const allFileSystemItems = await rayDb.findAll<FileSystemItem>('fileSystem');

let rootIdCache = null;
for (const directoryName of fileSystemStore.rootDirectories) {
  const element = allFileSystemItems.find(item => item.directory?.name === directoryName)
  if (element) {
    if (element.directory?.name === fileSystemStore.rootDirectories[0]) {
      rootIdCache = element.id;
    }
  } else {
    if (rootIdCache) {
      await insertItemIntoFileSystem(rayDb, [rootIdCache], {
        directory: { name: directoryName, children: [] },
      });
    } else {
      rootIdCache = await insertItemIntoFileSystem(rayDb, [], {
        directory: { name: directoryName, children: [] },
      });
    }
  }
}

const celebrationDir = await fileSystemLookup(rayDb, 'celebration');
if (!celebrationDir) {
  const parentDir = await fileSystemLookup(rayDb, 'files');
  if (parentDir && parentDir.id) {
    await insertItemIntoFileSystem(rayDb, [parentDir.id], {
      directory: { name: 'celebration', children: [] },
    });
  }
}

app.provide('rayDb', rayDb);
const theme = useThemeSwitcher().getTheme();
if (theme === '') {
  useThemeSwitcher().setTheme(Object.keys(themes)[0]);
} else {
  document.documentElement.setAttribute('data-theme', theme);
}

app.mount('#app');
