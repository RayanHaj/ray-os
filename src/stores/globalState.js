import {defineStore} from "pinia";
import {returnApplicationForFileType} from "@/utils/util";

export const useGlobalState = defineStore('globalState', {
    state: () => ({
        showGridOutlineDesktop: false,
        openWindows: [],
        desktopFiles: [],
        openTabs: [],
        playVideoObject: null,
        taskbarFiles: null,
        browserWindowSize: {
            HEIGHT_TASKBAR_EXCLUDED: 0,
            HEIGHT: 0,
            WIDTH: 0,
        },
        startBlockGame: false,
        playCloseAnimation: {},
        openTabsName: '',
        backgroundColor: '',
        wallpaper: '',
        theme: '',

        //DEBUG
        DISABLE_START_ANIMATION: true
    }),
    actions: {
        getShowGridOutlineDesktop() {
            const showGridOutlineDesktopLS = window.localStorage.getItem('showGridOutlineDesktop');

            if (this.showGridOutlineDesktop === false && showGridOutlineDesktopLS) {
                this.showGridOutlineDesktop = showGridOutlineDesktopLS;
            }

            return JSON.parse(this.showGridOutlineDesktop);
        },
        setShowGridOutlineDesktop(value) {
            this.showGridOutlineDesktop = value;
            window.localStorage.setItem('showGridOutlineDesktop', value);
        },
        getBackgroundColor() {
            const backgroundColorLS = window.localStorage.getItem('backgroundColor');

            if (this.backgroundColor === '' && backgroundColorLS) {
                this.backgroundColor = JSON.parse(backgroundColorLS);
            }

            return this.backgroundColor;
        },
        setBackgroundColor(value) {
            this.backgroundColor = value;
            window.localStorage.setItem('backgroundColor', JSON.stringify(value));
        },
        removeBackgroundColor() {
            if (this.backgroundColor !== '') {
                window.localStorage.removeItem('backgroundColor');
                this.backgroundColor = '';
            }
        },
        getWallpaper() {
            const wallpaperLS = window.localStorage.getItem('wallpaper');
            const backgroundColorLS = window.localStorage.getItem('backgroundColor');

            if (this.wallpaper === '' && wallpaperLS) {
                this.wallpaper = wallpaperLS;
            } else if (this.wallpaper === '' && wallpaperLS === null && this.backgroundColor === '' && backgroundColorLS === null) {
                this.setWallpaper('wallpaper_01.png');
            }

            return this.wallpaper;
        },
        setWallpaper(value) {
            this.wallpaper = value;
            window.localStorage.setItem('wallpaper', value);
        },
        removeWallpaper() {
            if (this.wallpaper !== '') {
                window.localStorage.removeItem('wallpaper');
                this.wallpaper = '';
            }
        },
        getTheme() {
            const themeLS = window.localStorage.getItem('theme');
            if (this.theme === '' && themeLS) {
                this.theme = themeLS;
            }

            return this.theme;
        },
        setTheme(value) {
            this.theme = value;
            window.localStorage.setItem('theme', value);
        },
        pushOpenWindow(element) {
            if (typeof element === 'object') {
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
            } else {
                console.error(`element: ${element} is not of type 'object'`)
            }
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
})