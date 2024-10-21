import {createRouter, createWebHistory} from "vue-router";
import DesktopHome from "@/components/desktopComponents/desktop-home";
import BatteryEasterEgg from "@/components/desktopComponents/easterEggsComponents/battery-easter-egg";
import EntryPoint from "@/components/entry-point";
import MobileHome from "@/components/mobileComponents/mobile-home";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "entry-point",
            component: EntryPoint,
        },
        {
            path: '/desktop-home',
            name: '/desktop-home',
            component: DesktopHome,
        },
        {
            path: '/mobile-home',
            name: 'mobile-home',
            component: MobileHome
        },
        {
            path: '/battery-drain',
            name: '/battery-drain',
            component: BatteryEasterEgg
        }
    ]
});

export default router;