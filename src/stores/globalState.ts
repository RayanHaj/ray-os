import {defineStore} from "pinia";
import {returnApplicationForFileType, safeLocalStorageFetch} from "@/utils/util";
import {inject, ref} from "vue";
import IndexedDb from "@/database/IndexedDb.js"
import {AppFile} from "@/types/files/AppFile";
import {ApplicationWindow} from "@/types/window/ApplicationWindow";
import {ApplicationTab} from "@/types/window/ApplicationTab";
import {BackgroundColor} from "@/types/preferences/BackgroundColor";
import {Wallpaper} from "@/types/preferences/Wallpaper";
import {Theme} from "@/types/preferences/Theme";
import {BrowserWindowSize} from "@/types/BrowserWindowSize";

export const useWindowStore = defineStore('window', () => {
    const openWindows = ref<ApplicationWindow[]>([]);
    const openTabs = ref<ApplicationTab[]>([]);
    const openTabsName = ref('');
    const playCloseAnimation = ref({});

    function pushOpenWindow(file: AppFile) {
        let id = 0;
        let zIndex = 0;

        if (openWindows.value.length > 0) {
            id = openWindows.value.length;
            zIndex = getHighestZIndex() + 1;
        }

        let name = file.name;
        if (file.type !== 'Application') {
            const openInApplicationName = returnApplicationForFileType(file.type);
            if (openInApplicationName === null) {
                console.error(`could not find compatible application for opening the file with id: ${file.id}`);
                return;
            }

            name = openInApplicationName;
        }

        const newWindowObject = {
            'id': id,
            "zIndex": zIndex,
            'name': name,
            'isMinimized': false,
            'fileProperties': file
        }

        openWindows.value.push(newWindowObject);

        return newWindowObject.id;
    }

    function pushToTopOpenWindows(windowId: number) {
        const window = openWindows.value.find(window => window.id === windowId);
        if (window !== undefined) {
            window.zIndex = openWindows.value.length + 1;
            openWindows.value.forEach(element => {
                if (element.zIndex === openWindows.value.length) {
                    return;
                }
                if (element.zIndex === 0) {
                    return;
                }
                if (window.id === element.id) {
                    return;
                }

                window.zIndex -= 1;
            });
        }
    }

    function getHighestZIndex() {
        let zIndex = 0;
        openWindows.value.forEach(window => {
            if (window.zIndex > zIndex) {
                zIndex = window.zIndex;
            }
        });
        return zIndex;
    }

    function pushToOpenTabs(windowName: string) {
        openTabs.value = [];

        const filteredWindowList = openWindows.value.filter(window => window.name === windowName);
        if (filteredWindowList.length > 0) {
            filteredWindowList.forEach(window => {
                const tab: ApplicationTab = {
                    id: window.id,
                    name: window.name
                }

                openTabs.value.push(tab);
            });
        }
    }

    function closeOpenWindowByWindowId(id: number) {
        openWindows.value = openWindows.value.filter((window: ApplicationWindow) => window.id !== id);
    }

    return {
        openWindows,
        openTabs,
        openTabsName,
        playCloseAnimation,
        pushOpenWindow,
        pushToTopOpenWindows,
        pushToOpenTabs,
        closeOpenWindowByWindowId
    }
});
export const useFileStore = defineStore('file', () => {
    const dbInstance = inject<IndexedDb>('db');

    const files = ref<File[]>([]);
    const desktopFiles = ref<AppFile[]>([]);
    const taskbarFiles = ref<AppFile[]>([]);

    async function init() {
        files.value = await dbInstance?.getAllElements('files');
        desktopFiles.value = await dbInstance?.getAllElements('desktopFiles');
        taskbarFiles.value = await dbInstance?.getAllElements('taskbarFiles');
    }

    return {
        files,
        desktopFiles,
        taskbarFiles,
        init
    }
});
export const usePreferencesStore = defineStore('preferences', () => {
    const backgroundColor = ref<BackgroundColor | null>(null);
    const wallpaper = ref<Wallpaper | null>(null);
    const theme = ref<Theme | null>(null);
    const showDesktopGridOutline = ref<boolean>(false);
    const DISABLE_START_ANIMATION = ref<boolean>(true);

    function backgroundColorValue() {
        const get = () => {
            const {value, error} = safeLocalStorageFetch('backgroundColor', 'object', '');
            if (error) {
                console.error('failed to fetch value from localStorage for localStorageKey', error);
            }

            if (value !== '') {
                return value
            }

            if (backgroundColor.value !== null) {
                return backgroundColor.value;
            }

            return null;
        }

        const set = (color: BackgroundColor) => {
            backgroundColor.value = color;
            window.localStorage.setItem('backgroundColor', JSON.stringify(color));
        }

        return {get, set}
    }

    function themeValue() {
        const get = () => {
            const {value, error} = safeLocalStorageFetch('theme', 'string', '');
            if (error) {
                console.error('failed to fetch value from localStorage for localStorageKey', error);
            }

            if (value !== '') {
                return value;
            }

            if (theme.value !== null) {
                return theme.value;
            }

            return null;
        }

        const set = (value: Theme) => {
            theme.value = value;
            window.localStorage.setItem('theme', value.name);
        }

        return {get, set}
    }

    function wallpaperValue() {
        const get = () => {
            const {value, error} = safeLocalStorageFetch('wallpaper', 'string', '');
            if (error) {
                console.error('failed to fetch value from localStorage for localStorageKey', error);
            }

            if (value !== '') {
                return value;
            }

            if (wallpaper.value !== null) {
                return wallpaper.value;
            }

            return null;
        }

        const set = (value: Wallpaper) => {
            wallpaper.value = value;
            window.localStorage.setItem('wallpaper', value.name);
        }

        return {get, set}
    }

    function showDesktopGridOutlineValue() {
        const get = () => {
            const {value, error} = safeLocalStorageFetch('showGridOutlineDesktop', 'boolean', false);
            if (error) {
                console.error('failed to fetch value from localStorage for localStorageKey', error);
            }

            if (value !== '') {
                return value;
            }

            if (showDesktopGridOutline.value !== null) {
                return showDesktopGridOutline.value;
            }

            return null;
        }

        const set = (value: boolean) => {
            showDesktopGridOutline.value = value;
            window.localStorage.setItem('showGridOutlineDesktop', JSON.stringify(value));
        }

        return {get, set}
    }

    return {
        backgroundColorValue,
        themeValue,
        wallpaperValue,
        showDesktopGridOutlineValue,
        DISABLE_START_ANIMATION
    }
});
export const useApplicationStatesStore = defineStore('applicationStates', () => {
    const currentVideoObject = ref({})
    return {currentVideoObject}
});
export const useGlobalStore = defineStore('global', () => {
    const browserWindowSize = ref<BrowserWindowSize>({
        HEIGHT_TASKBAR_EXCLUDED: 0,
        HEIGHT: 0,
        WIDTH: 0,
    });

    return {browserWindowSize}
});