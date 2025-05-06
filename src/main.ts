import './assets/main.css';

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
  useThemeSwitcher().setTheme('midnight-neon');
} else {
  document.documentElement.setAttribute('data-theme', theme);
}

app.mount('#app');
