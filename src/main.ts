import './assets/main.css';
import themes from '@/json/themes.json';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { useThemeSwitcher } from '@/composables/useThemeSwitcher.ts';
import { RayDb } from 'ray-db-wrapper';

import App from './App.vue';
import router from './router';
import { fileSystemLookup, insertItemIntoFileSystem } from '@/composables/useIndexedDbHelper.ts';

const app = createApp(App);

app.use(createPinia());
app.use(router);

const rayDb = await RayDb.create('desktop', 1, [
  {
    name: 'files',
    keyPath: 'id',
    indexes: [
      {indexName: 'name', keyPath: 'name', unique: true},
      {indexName: 'type', keyPath: 'type', unique: false},
    ],
    autoIncrement: true
  },
  {
    name: 'fileSystem',
    keyPath: 'id',
    indexes: [
      {indexName: 'id', keyPath: 'id', unique: true},
      {indexName: 'parents', keyPath: 'parents', unique: false},
      {indexName: 'file', keyPath: 'file', unique: false},
      {indexName: 'directory', keyPath: 'directory.name', unique: false},
    ],
    autoIncrement: true
  },
]);
const rootDir = await insertItemIntoFileSystem(rayDb,[], {
  directory: { name: 'C:', children: [] }
});

if (rootDir) {
  await insertItemIntoFileSystem(rayDb,[rootDir], {
    directory: { name: 'applications', children: [] }
  });
  await insertItemIntoFileSystem(rayDb,[rootDir], {
    directory: { name: 'files', children: [] }
  });
}

const value = await fileSystemLookup(rayDb, 'C:/files');
console.log(value);


app.provide('rayDb', rayDb);

const theme = useThemeSwitcher().getTheme();
if (theme === '') {
  useThemeSwitcher().setTheme(Object.keys(themes)[0]);
} else {
  document.documentElement.setAttribute('data-theme', theme);
}

app.mount('#app');
