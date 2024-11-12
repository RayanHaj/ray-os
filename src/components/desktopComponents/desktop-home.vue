<template>
  <div v-if="activatedEasterEgg === null"
       class="desktop"
       :style="{ filter: `brightness(${desktopBrightnessValue}%)`}">
    <div class="main-screen">
      <MainWindow
          v-for="window in openWindows"
          :key="window.windowName"
          :class="window.windowName"
          class="window"
          :style="{zIndex: openWindows.find(openWindow => openWindow.windowName === window.windowName).zIndex}"
          :window-name="window.windowName"
          @click="onClickWindow($event, window)"
          @battery-easter-egg-activated="activatedEasterEgg = $event"
          @rendered="windowIsRendered = !windowIsRendered"
          @theme-changed="$emit('themeChanged')"
          @close-tab="closeWindow"
          @minimize-window="minimizeWindow"
          @split-other-window="splitOtherWindow = $event"
          :window-size="windowDimensions"
          :open-windows="openWindows"
          :split-other-window="splitOtherWindow"
      />
      <DesktopGrid
          @application-name="setApplicationNameVariable"
          :application-names="applicationNames"
          :window-size="windowDimensions"
          class="desktop-grid"/>
    </div>
    <div class="footer-container">
      <SettingsMenu v-if="quickSettingMenuIsOpen"
                    ref="settingsMenu"
                    class="quick-settings-menu"
                    @brightness-value-changed="updateBrightnessValue"
      />
      <FooterBar ref="footerBar"
                 class="footer"
                 @application-name="setApplicationNameVariable"
                 @quick-settings-menu-open="openQuickSettingsMenu"
                 @close-window="closeWindow"
                 :application-names="applicationNames"
                 :open-windows="openWindows"
      />
    </div>
  </div>
</template>

<script>
import FooterBar from "@/components/desktopComponents/footer/footer-bar";
import DesktopGrid from "@/components/sharedComponents/desktop-grid";
import MainWindow from "@/components/desktopComponents/draggableWindows/main-window";
import SettingsMenu from "@/components/desktopComponents/footer/footerComponents/settings-menu";
import {deviceIsMobile} from "@/utils/util";

export default {
  name: "desktop-home",
  data() {
    return {
      windowIsRendered: false,
      quickSettingMenuIsOpen: false,
      closingWindow: false,
      activatedEasterEgg: null,
      windowWidth: '',
      windowHeight: '',
      applicationName: '',
      splitOtherWindow: {},
      openWindows: [],
      windowDimensions: [],
      highestZIndex: 1,
      backgroundColor: 'black',
      desktopBrightnessValue: 100,
      applicationNames: ['windows-start', 'microsoft-edge', 'file-explorer', 'settings'],
    }
  },
  components: {SettingsMenu, MainWindow, DesktopGrid, FooterBar},
  props: {
    backgroundImageId: Number
  },
  emits: ['themeChanged'],
  async mounted() {
    if (deviceIsMobile() === true) {
      this.$router.push('/');
    }

    this.updateSettings();

    window.addEventListener('resize', this.updateWindowDimensions);
    window.addEventListener('click', await this.closeOpenWindows);
  },
  created() {
    this.windowDimensions = [window.innerWidth, window.innerHeight - 45]
  },
  async beforeUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
    window.removeEventListener('click', await this.closeOpenWindows);
  },
  methods: {
    setApplicationNameVariable(name) {
      const window = this.openWindows.find(window => window.windowName === name)
      if (!window) {
        this.openWindows.push({'windowName': name, 'zIndex': this.highestZIndex, 'minimized': false});
        this.applicationName = name;
        this.highestZIndex++;
        return;
      }

      this.$el.querySelector(`.${name}`).style.display = 'flex';
      window.minimized = false;
    },
    updateBrightnessValue() {
      const value = localStorage.getItem('brightnessValue');
      if (value !== null) {
        this.desktopBrightnessValue = value;
      }
    },
    closeWindow(value) {
      const closeWindowId = this.openWindows.findIndex(window => window.windowName === value);

      this.openWindows.splice(closeWindowId, 1);

      this.sortWindowArray();
      if (value === 'settings') {
        this.updateSettings();
      }

      this.applicationName = '';
    },
    onClickWindow(e, window) {
      const mouseTarget = e.target.parentNode;
      if (this.closingWindow !== true && mouseTarget.classList[0] !== 'window-state-control') {
        const windowIndex = this.openWindows.findIndex(openWindow => openWindow.windowName === window.windowName);
        this.openWindows.splice(windowIndex, 1);
        this.openWindows.push(window);
        this.sortWindowArray();
      }
    },
    updateWindowDimensions() {
      const NAVBAR_HEIGHT = 45;
      this.windowDimensions = [this.$el.offsetWidth, this.$el.offsetHeight - NAVBAR_HEIGHT];
    },
    updateSettings() {
      const desktopElement = this.$el;

      const desktopBrightness = localStorage.getItem('brightnessValue');
      if (desktopBrightness) {
        this.desktopBrightnessValue = desktopBrightness;
      }

      const backgroundPreference = localStorage.getItem('background-preference');

      if (Number(backgroundPreference) === 1) {
        const backgroundColor = localStorage.getItem('background-color');
        if (backgroundColor) {
          this.backgroundColor = backgroundColor;
          desktopElement.style.backgroundColor = this.backgroundColor;
          desktopElement.style.backgroundImage = null;
        } else {
          this.backgroundColor = '#0A162C'
          desktopElement.style.backgroundColor = this.backgroundColor;
          desktopElement.style.backgroundImage = null;
        }
      } else {
        let backgroundImage = Number(localStorage.getItem('background-image')) ? Number(localStorage.getItem('background-image')) : 1;
        if (backgroundImage !== 0) {
          desktopElement.style.backgroundImage = `url(${require(`@/assets/images/desktopWallpapers/wallpaper_0${backgroundImage}.png`)})`;
        }
      }
    },
    async openQuickSettingsMenu() {
      const settingsMenu = this.$refs.settingsMenu;

      if (this.quickSettingMenuIsOpen) {
        await settingsMenu.closeSettingsMenuAnimation().then(() => {
          this.quickSettingMenuIsOpen = !this.quickSettingMenuIsOpen;
        });
        return;
      }

      this.quickSettingMenuIsOpen = !this.quickSettingMenuIsOpen;
    },
    validateBeforeClosingWindows(settingsMenu, footer, e) {
      if (!this.quickSettingMenuIsOpen) {
        return false;
      }

      if (footer.getRefQuickSettingsMenuButton().contains(e.target)) {
        return false;
      }

      const children = Array.from(settingsMenu.$el.querySelectorAll('.btn'));
      const btnElements = children.filter((child => child.classList.contains('btn')));

      let result = null;
      for (let element of btnElements) {
        if (element.contains(e.target)) {
          result = true;
        }
      }

      if (result) {
        return result;
      }

      if (settingsMenu.$el.contains(e.target)) {
        return false;
      }

      return true;
    },
    async closeOpenWindows(e) {
      if (this.quickSettingMenuIsOpen === true) {
        e.preventDefault();
        const settingsMenu = this.$refs.settingsMenu;
        const footer = this.$refs.footerBar;
        if (footer) {
          if (this.validateBeforeClosingWindows(settingsMenu, footer, e)) {
            await settingsMenu.closeSettingsMenuAnimation().then(() => {
              this.quickSettingMenuIsOpen = !this.quickSettingMenuIsOpen;
            });
          }
        }
      }
    },
    easterEggCompleted() {
      this.activatedEasterEgg = null;
      this.$nextTick(() => {
        this.updateSettings();
      })
    },

    minimizeWindow(windowName) {
      const window = this.openWindows.find(window => window.windowName === windowName);
      const windowElement = this.$el.querySelector(`.${windowName}`);
      windowElement.style.display = 'none';
      window.minimized = true;
    },

    sortWindowArray() {
      if (this.openWindows.length > 0) {
        let counter = 2;
        this.openWindows.forEach(window => {
          window.zIndex = counter++;
        });
        this.highestZIndex = counter;
        this.$el.querySelector('.footer').style.zIndex = this.highestZIndex + 1;
      }
    }
  },
  watch: {
    windowIsRendered() {
      this.updateWindowDimensions();
    },

    activatedEasterEgg() {
      console.log(this.activatedEasterEgg);
    }
  }
}
</script>

<style scoped>
* {
  color: var(--font-color);
}

.desktop {
  position: fixed;
  height: 100%;
  width: 100%;
  background-size: cover;
  background-position: center;
  z-index: 1;
}

.desktop-grid {
  height: auto;
  overflow: hidden;
}

.window {
  position: absolute;
  width: 100%;
  height: calc(100% - 45px);
}

.footer {
  z-index: 2;
}

.quick-settings-menu {
  position: fixed;
  right: 20px;
  bottom: 60px;
  width: 350px;
}

.footer-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>