import {createRouter, createWebHistory} from "vue-router";
import DesktopHome from "@/components/DesktopView";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: '/desktop-home',
            component: DesktopHome,
        },
    ]
});

export default router;