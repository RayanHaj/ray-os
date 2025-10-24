import './assets/main.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import { useRayDbInit } from '@/composables/initialization/useRayDbInit.ts';
import { useFileSystemInit } from '@/composables/initialization/useFileSystemInit.ts';
import { useThemeInit } from '@/composables/initialization/useThemeInit.ts';

const app = createApp(App);
app.use(createPinia());

const rayDb = await useRayDbInit();
await useFileSystemInit(rayDb);
app.provide('rayDb', rayDb);

useThemeInit();
app.mount('#app');
