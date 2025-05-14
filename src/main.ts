import './assets/main.css';
import themes from '@/json/themes.json';
import { IdbWrapperService } from './database/idbWrapperService';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { useThemeSwitcher } from '@/composables/useThemeSwitcher.ts';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);

const theme = useThemeSwitcher().getTheme();
if (theme === '') {
  useThemeSwitcher().setTheme(Object.keys(themes)[0]);
} else {
  document.documentElement.setAttribute('data-theme', theme);
}

let idbWrapper: IdbWrapperService;
try {
  idbWrapper = await IdbWrapperService.create('desktop', 1, [
    {
      name: 'files',
      keyPath: 'id',
      indexes: [
        { indexName: 'name', keyPath: 'name', unique: true },
        { indexName: 'type', keyPath: 'type', unique: false },
      ],
      autoIncrement: true,
    },
  ]);

  app.provide('dbService', idbWrapper);
} catch (error) {
  console.error(error);
}

app.mount('#app');
