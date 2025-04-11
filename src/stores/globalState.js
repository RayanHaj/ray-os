import {defineStore} from "pinia";
import {returnApplicationForFileType, safeLocalStorageFetch} from "@/utils/util";

export const useWindowStore = defineStore('window', {
    state: () => ({
        openWindows: [],
        openTabs: [],
        openTabsName: '',
        playCloseAnimation: {},
    }),
    actions: {
        pushOpenWindow(element) {
            if (typeof element !== 'object') {
                console.error(`element: ${element} is not of type 'object'`)
                return;
            }

            let id = 0;
            let zIndex = 0;

            if (this.openWindows.length > 0) {
                id = this.openWindows.length;
                zIndex = this.getHighestZIndex() + 1;
            }

            let windowName = element.name;
            if (element.type !== 'Application') {
                windowName = returnApplicationForFileType(element.type);
            }

            const newWindowObject = {
                'id': id,
                "zIndex": zIndex,
                'name': windowName,
                'minimized': false,
                'fileProperties': element
            }

            this.openWindows.push(newWindowObject);
            return newWindowObject.id;
        },
        pushToTopOpenWindows(windowId) {
            const window = this.openWindows.find(window => Number(window.id) === Number(windowId));
            if (window !== undefined) {
                window.zIndex = this.openWindows.length + 1;
                this.openWindows.forEach(element => {
                    if (element.zIndex === this.openWindows.length) {
                        return;
                    }
                    if (element.zIndex === 0) {
                        return;
                    }
                    if (element.id === window.id) {
                        return;
                    }

                    element.zIndex -= 1;
                });
            }
        },
        getHighestZIndex() {
            let zIndex = 0;
            this.openWindows.forEach(element => {
                if (element.zIndex > zIndex) {
                    zIndex = element.zIndex;
                }
            });
            return zIndex;
        },
        pushToOpenTabs(name) {
            this.openTabs = [];

            const filteredWindowList = this.openWindows.filter(window => window.name === name);
            if (filteredWindowList.length > 0) {
                filteredWindowList.forEach(window => this.openTabs.push({
                        id: window.id,
                        name: window.name
                    })
                );
            }
        },
        closeOpenWindowByWindowId(id) {
            this.openWindows = this.openWindows.filter(window => window.id !== id);
        }
    }
});
export const useFileStore = defineStore('file', {
    state: () => ({
        desktopFiles: [],
        taskbarFiles: []
    })
});
export const usePreferencesStore = defineStore('preferences', {
    state: () => ({
        backgroundColor: '',
        wallpaper: '',
        theme: '',
        showGridOutlineDesktop: false,
        DISABLE_START_ANIMATION: true,
    }),
    actions: {
        getShowGridOutlineDesktop() {
            const {value, error} = safeLocalStorageFetch('showGridOutlineDesktop', 'boolean', false);
            if (error) {
                console.error('failed to fetch value from localStorage for localStorageKey', error);
            }

            return value;
        },
        setShowGridOutlineDesktop(value) {
            if (typeof value !== 'boolean') return;
            this.showGridOutlineDesktop = value;
            window.localStorage.setItem('showGridOutlineDesktop', JSON.stringify(value));
        },
        getTheme() {
            const {value, error} = safeLocalStorageFetch('theme', 'string', '');
            if (error) {
                console.error('failed to fetch value from localStorage for localStorageKey', error);
            }

            console.log(value)

            return value;
        },
        setTheme(value) {
            this.theme = value;
            window.localStorage.setItem('theme', value);
        },
        getBackgroundColor() {
            const {value, error} = safeLocalStorageFetch('backgroundColor', 'object', '');
            if (error) {
                console.error('failed to fetch value from localStorage for localStorageKey', error);
            }

            return value;
        },
        setBackgroundColor(value) {
            if (typeof value !== 'object') return;
            this.backgroundColor = value;
            window.localStorage.setItem('backgroundColor', JSON.stringify(value));
        },
        removeBackgroundColor() {
            window.localStorage.removeItem('backgroundColor');
            this.backgroundColor = '';
        },
        getWallpaper() {
            const {value, error} = safeLocalStorageFetch('wallpaper', 'string', '');
            if (error) {
                console.error('failed to fetch value from localStorage for localStorageKey', error);
            }

            return value;
        },
        setWallpaper(value) {
            if (typeof value !== 'string') return;
            this.wallpaper = value;
            window.localStorage.setItem('wallpaper', value);
        },
        removeWallpaper() {
            window.localStorage.removeItem('wallpaper');
            this.wallpaper = '';
        }
    }
});
export const useApplicationStatesStore = defineStore('applicationStates', {
    state: () => ({
        currentVideoObject: {}
    })
});
export const useGlobalStore = defineStore('global', {
    state: () => ({
        browserWindowSize: {
            HEIGHT_TASKBAR_EXCLUDED: 0,
            HEIGHT: 0,
            WIDTH: 0,
        },
    })
});