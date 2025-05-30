import './assets/main.css';
import themes from '@/json/themes.json';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { useThemeSwitcher } from '@/composables/useThemeSwitcher.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { RayDb } from 'ray-db-wrapper';

import App from './App.vue';
import router from './router';
import { insertItemIntoFileSystem } from '@/composables/useIndexedDbHelper.ts';
import { useFileStore } from '@/stores/file.ts';

const app = createApp(App);

app.use(createPinia());
app.use(router);

const rayDb = await RayDb.create('desktop', 1, [
  {
    name: 'files',
    keyPath: 'id',
    indexes: [
      { indexName: 'label', keyPath: 'label', unique: true },
      { indexName: 'content', keyPath: 'content', unique: false }
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

const rootDirectory = fileSystemStore.rootDirectory;
const parentId = await insertItemIntoFileSystem(rayDb, [], {
  directory: { name: rootDirectory, children: [] },
});

if (parentId) {
  await insertItemIntoFileSystem(rayDb, [parentId], {
    directory: { name: 'Applications', children: [] }
  })
}

await useFileStore().initializeFiles(rayDb);

app.provide('rayDb', rayDb);
const theme = useThemeSwitcher().getTheme();
if (theme === '') {
  useThemeSwitcher().setTheme(Object.keys(themes)[0]);
} else {
  document.documentElement.setAttribute('data-theme', theme);
}

app.mount('#app');
