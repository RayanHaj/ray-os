import {defineStore} from "pinia";

export const useGlobalState = defineStore('globalState', {
    state: () => ({
        showGridOutlineDesktop: false,
        openWindows: [],
        desktopFiles: [],
        taskbarFiles: null,
        browserWindowSize: {
            HEIGHT_TASKBAR_EXCLUDED: 0,
            HEIGHT: 0,
            WIDTH: 0,
        },
        backgroundColor: '',
        wallpaper: '',
        theme: ''
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
        removeTheme() {
            if (this.theme !== '') {
                window.localStorage.removeItem('theme');
                this.theme = '';
            }
        },
        pushOpenWindow(object) {
            let id = 0;
            if (this.openWindows.length > 0) {
                id = this.openWindows.length;
            }

            let windowName = object.name;
            if (object.type !== 'Application') {
                windowName = returnApplicationForFileType(object.type);
            }

            console.log(id, windowName)

            const newWindowObject = {
                'id': id,
                'name': windowName,
                'zIndex': null,
                'minimized': false,
                'values': object
            }

            this.openWindows.push(newWindowObject);

            function returnApplicationForFileType(type) {
                let returnValue = null;
                switch (type) {
                    case 'video/mp4': {
                        returnValue = 'Video Player';
                        break;
                    }
                }

                return returnValue;
            }
        },
        closeOpenWindowByWindowId(id) {
            this.openWindows = this.openWindows.filter(window => window.id !== id);
        },
    }
})