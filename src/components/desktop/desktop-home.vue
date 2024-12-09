<template>
  <div v-if="activatedEasterEgg === null"
       class="desktop"
       :style="{ filter: `brightness(${desktopBrightnessValue}%)`}">
    <div class="main-screen">
      <MainWindow
          v-for="window in openWindows"
          class="window"
          :key="window.windowName"
          :ref="window.windowName"
          :style="{zIndex: openWindows.find(openWindow => openWindow.windowName === window.windowName).zIndex}"
          :window-name="window.windowName"
          @clicked="onClickWindow($event, window)"
          @battery-easter-egg-activated="activatedEasterEgg = $event"
          @rendered="windowIsRendered = !windowIsRendered"
          @theme-changed="$emit('themeChanged')"
          @close-window="closeWindow"
          @minimize-window="minimizeWindow"
          @split-other-window="splitOtherWindow = $event"
          @preview-application-window="this.previewApplicationWindow = $event"
          @window-resizing="windowIsResizing = $event"
          :window-size="windowDimensions"
          :open-windows="openWindows"
          :split-other-window="splitOtherWindow"
          :taskbar-height="TASKBAR_HEIGHT"
          :current-hovered-image-taskbar-name="currentHoveredImageTaskbarName"
      />
      <DesktopGrid
          @application-name="setApplicationNameVariable"
          :window-size="windowDimensions"
          :window-resizing="windowIsResizing"
          class="desktop-grid"/>
    </div>
    <div class="footer-container">
      <SettingsMenu v-if="quickSettingMenuIsOpen"
                    ref="settingsMenu"
                    class="quick-settings-menu"
                    @brightness-value-changed="updateBrightnessValue"
      />
      <taskbar ref="taskbar"
               class="taskbar"
               @application-name="setApplicationNameVariable"
               @quick-settings-menu-open="openQuickSettingsMenu"
               @close-window="closeWindow"
               @hovering-on-window-image-taskbar="currentHoveredImageTaskbarName = $event"
               :open-windows="openWindows"
               :height="TASKBAR_HEIGHT"
               :preview-application-window="previewApplicationWindow"
      />
    </div>
  </div>
</template>

<script>
import taskbarFooter from "@/components/desktop/taskbar/taskbar-footer";
import ApplicationGrid from "@/components/sharedComponents/application-grid";
import ApplicationWindow from "@/components/desktop/window/application-window";
import SettingsMenu from "@/components/desktop/taskbar/taskbarComponents/settings-menu";
import {deviceIsMobile} from "@/utils/util";

export default {
  name: "desktop-home",
  data() {
    return {
      TASKBAR_HEIGHT: 44,
      windowIsRendered: false,
      windowIsResizing: false,
      quickSettingMenuIsOpen: false,
      closingWindow: false,
      activatedEasterEgg: null,
      currentHoveredImageTaskbarName: null,
      previewApplicationWindow: null,
      applicationName: '',
      splitOtherWindow: {},
      openWindows: [],
      windowDimensions: [],
      highestZIndex: 1,
      backgroundColor: 'black',
      desktopBrightnessValue: 100,
    }
  },
  components: {SettingsMenu, MainWindow: ApplicationWindow, DesktopGrid: ApplicationGrid, taskbar: taskbarFooter},
  props: {
    backgroundImageId: Number
  },
  emits: ['themeChanged', 'clicked'],
  mounted() {
    if (deviceIsMobile() === true) {
      this.$router.push('/');
    }

    this.updateSettings();

    window.addEventListener('resize', this.updateWindowDimensions);
    window.addEventListener('click', this.closeOpenWindows);
  },
  created() {
    this.windowDimensions = [window.innerWidth, (window.innerHeight - this.TASKBAR_HEIGHT)];
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
    window.removeEventListener('click', this.closeOpenWindows);
  },
  watch: {
    windowIsRendered() {
      this.updateWindowDimensions();
    },

    activatedEasterEgg() {
      console.log(this.activatedEasterEgg);
    }
  },
  methods: {
    setApplicationNameVariable(name) {
      const window = this.openWindows.find(window => window.windowName === name);
      if (!window) {
        this.openWindows.push({'windowName': name, 'zIndex': this.highestZIndex, 'minimized': false});
        this.applicationName = name;
        this.highestZIndex++;

        this.$nextTick(() => {
          this.$el.querySelectorAll('.window').forEach(element => {
            console.log(element)
            if (name === element.querySelector('.window-name').innerText) {
              element.style.height = `calc(100% - ${this.TASKBAR_HEIGHT}px)`;
            }
          });
        });

        return;
      }

      const windowComponent = this.$refs[name][0];

      if (windowComponent) {
        windowComponent.$el.style.display = 'flex';
        window.minimized = false;
      }
    },
    updateBrightnessValue() {
      const value = localStorage.getItem('brightnessValue');
      if (value !== null) {
        this.desktopBrightnessValue = value;
      }
    },
    closeWindow(value) {
      new Promise((resolve, reject) => {
        const closeWindowId = this.openWindows.findIndex(window => window.windowName === value);
        this.openWindows.splice(closeWindowId, 1);

        console.log(this.openWindows)

        if (this.openWindows[closeWindowId]) {
          this.openWindows[closeWindowId].windowName !== value ? resolve() : reject();
        } else {
          resolve();
        }
      }).then((error) => {
        if (error) {
          console.log('error closing window');
          return;
        }
        console.log('closeWindow')
        this.sortWindowArray();
        if (value === 'settings') {
          this.updateSettings();
        }
        this.applicationName = '';
      });
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
      this.windowDimensions = [window.innerWidth, (window.innerHeight - this.TASKBAR_HEIGHT)];
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
      const settingsMenu = this.$refs.taskbar;

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
    closeOpenWindows(e) {
      if (this.quickSettingMenuIsOpen === true) {
        e.preventDefault();
        const settingsMenu = this.$refs.settingsMenu;
        const taskbar = this.$refs.footerBar;
        if (taskbar) {
          if (this.validateBeforeClosingWindows(settingsMenu, taskbar, e)) {
            settingsMenu.closeSettingsMenuAnimation().then(() => {
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
      const windowComponent = this.$refs[windowName][0];

      console.log(windowComponent)

      if (windowComponent) {
        windowComponent.$el.style.display = 'none';
        window.minimized = true;
      }
    },

    sortWindowArray() {
      if (this.openWindows.length > 0) {
        console.log('hello Per')
        let counter = 2;
        this.openWindows.forEach(window => {
          window.zIndex = counter++;
        });
        this.highestZIndex = counter;
        this.$el.querySelector('.taskbar').style.zIndex = this.highestZIndex + 1;
      }
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
}

.taskbar {
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