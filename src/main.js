import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from "pinia";
import IndexedDb from "@/database/IndexedDb";

const app = createApp(App);
const pinia = createPinia();

async function initDb() {
    const dbInstance = new IndexedDb("myDatabase", 1);
    await dbInstance.init();
    app.provide('db', dbInstance);
}

initDb().then(() => {
    app.use(pinia);
    app.use(router);
    app.mount('#app');
});
