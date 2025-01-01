<template>
  <div class="desktop"
       ref="desktop"
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
          @clicked="activateQuickSettingsMenu(false)"
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
               @quick-settings-menu-open="activateQuickSettingsMenu(true)"
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
import {useGlobalState} from "@/stores/globalState";
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
  emits: ['clicked'],
  mounted() {
    if (deviceIsMobile() === true) {
      this.$router.push('/');
    }

    if (this.globalState.getBackgroundColor() !== '') {
      this.setBackgroundColor();
    } else if (this.globalState.getWallpaper() !== '') {
      this.setWallpaper();
    } else {
      this.setWallpaper();
    }

    window.addEventListener('resize', this.updateWindowDimensions);
  },
  created() {
    this.windowDimensions = [window.innerWidth, (window.innerHeight - this.TASKBAR_HEIGHT)];
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  },
  watch: {
    windowIsRendered() {
      this.updateWindowDimensions();
    },
    activatedEasterEgg() {
      console.log(this.activatedEasterEgg);
    },
    'globalState.backgroundColor'() {
      if (this.globalState.backgroundColor !== '') {
        this.setBackgroundColor();
      }
    },
    'globalState.wallpaper'() {
      if (this.globalState.wallpaper !== '') {
        this.setWallpaper();
      }
    },
  },
  computed: {
    globalState() {
      return useGlobalState();
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
    setBackgroundColor() {
      let backgroundColor = this.globalState.getBackgroundColor();

      this.globalState.removeWallpaper();

      this.$refs.desktop.style.backgroundImage = 'none'
      this.$refs.desktop.style.backgroundColor = backgroundColor.color;
    },
    setWallpaper() {
      let wallpaper = this.globalState.getWallpaper();

      this.globalState.removeBackgroundColor();

      this.$refs.desktop.style.backgroundImage = `url(${require(`@/assets/images/desktopWallpapers/${wallpaper}`)})`;
      this.$refs.desktop.style.backgroundColor = 'none';
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

        if (this.openWindows[closeWindowId]) {
          this.openWindows[closeWindowId].windowName !== value ? resolve() : reject();
        } else {
          resolve();
        }
      }).then((error) => {
        if (error) {
          return;
        }
        this.sortWindowArray();
        this.applicationName = '';
      });
    },
    onClickWindow(e, window) {
      this.activateQuickSettingsMenu(false);
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
    activateQuickSettingsMenu(quickSettingsMenuButtonClicked) {
      if (quickSettingsMenuButtonClicked) {
        this.quickSettingMenuIsOpen === true ?
            this.quickSettingMenuIsOpen = false :
            this.quickSettingMenuIsOpen = true;
      } else {
        if (this.quickSettingMenuIsOpen === true) {
          this.quickSettingMenuIsOpen = false;
        }
      }
    },
    minimizeWindow(windowName) {
      const window = this.openWindows.find(window => window.windowName === windowName);
      const windowComponent = this.$refs[windowName][0];

      if (windowComponent) {
        windowComponent.$el.style.display = 'none';
        window.minimized = true;
      }
    },
    sortWindowArray() {
      if (this.openWindows.length > 0) {
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