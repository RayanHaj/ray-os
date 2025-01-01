import { defineStore } from "pinia";

export const useGlobalState = defineStore('globalState', {
    state: () => ({
        openWindows: [],
        backgroundColor: '',
        wallpaper: '',
        theme: '',
    }),
    actions: {
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

            if (this.wallpaper === '' && wallpaperLS) {
                this.wallpaper = wallpaperLS;
            } else if (this.wallpaper === '' && wallpaperLS === null) {
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
    }
})