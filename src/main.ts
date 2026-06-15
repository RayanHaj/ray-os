import './assets/main.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import { useRayDbInit } from '@/composables/initialization/useRayDbInit.ts';
import { useFileSystemInit } from '@/composables/initialization/useFileSystemInit.ts';
import { useThemeInit } from '@/composables/initialization/useThemeInit.ts';

// Gather permission to use persistent storage (IDB)
await navigator.storage.persist();

const app = createApp(App);
app.use(createPinia());

// Initialize IDB instance
const rayDb = await useRayDbInit();
app.provide('rayDb', rayDb);

await useFileSystemInit(rayDb);

useThemeInit();
app.mount('#app');
