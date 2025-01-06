<template>
  <div class="desktop"
       ref="desktop"
       :style="{ filter: `brightness(${desktopBrightnessValue}%)`}">
    <div class="main-screen">
      <MainWindow
          v-for="window in this.globalState.openWindows"
          class="window"
          :ref="window.name"
          :key="window.name"
          :id="window.id"
          :style="{zIndex: this.globalState.openWindows.find(openWindow => openWindow.id === window.id).zIndex}"
          :window-id="window.id"
          :window-size="windowDimensions"
          :split-other-window="splitOtherWindow"
          :taskbar-height="TASKBAR_HEIGHT"
          :current-hovered-image-taskbar-name="currentHoveredImageTaskbarName"
          @clicked="onClickWindow($event, window)"
          @rendered="windowIsRendered = !windowIsRendered"
          @minimize-window="minimizeWindow"
          @split-other-window="splitOtherWindow = $event"
          @preview-application-window="this.previewApplicationWindow = $event"
          @window-resizing="windowIsResizing = $event"
      />
      <DesktopGrid
          @clicked="activateQuickSettingsMenu(false)"
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
               @quick-settings-menu-open="activateQuickSettingsMenu(true)"
               @hovering-on-window-image-taskbar="currentHoveredImageTaskbarName = $event"
               :height="TASKBAR_HEIGHT"
               :preview-application-window="previewApplicationWindow"
      />
    </div>
  </div>
</template>

<script>
import taskbarFooter from "@/components/desktop/taskbar/taskbar-footer";
import DesktopGrid from "@/components/desktop/desktop-grid";
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
  components: {SettingsMenu, MainWindow: ApplicationWindow, DesktopGrid: DesktopGrid, taskbar: taskbarFooter},
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

    this.globalState.browserWindowSize.WIDTH = this.$el.getBoundingClientRect().width;
    this.globalState.browserWindowSize.HEIGHT = this.$el.getBoundingClientRect().height;
    this.globalState.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED = this.$el.getBoundingClientRect().height - this.TASKBAR_HEIGHT;

    window.addEventListener('resize', this.updateWindowDimensions);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  },
  watch: {
    windowIsRendered() {
      this.updateWindowDimensions();
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
    'globalState.openWindows.length'(newValue, oldValue) {
      if (newValue > oldValue) {
        const newElement = this.globalState.openWindows[this.globalState.openWindows.length - 1];
        this.$nextTick(() => {
          const windowElement = this.$refs[newElement.name][0];
          if (Number(windowElement.$el.id) === newElement.id) {
            windowElement.$el.style.height = `calc(100% - ${this.TASKBAR_HEIGHT}px)`;
            windowElement.$el.style.display = 'flex';
            window.minimized = false;
          }
        });
      }
    },
  },
  computed: {
    globalState() {
      return useGlobalState();
    }
  },
  methods: {
    setApplicationNameVariable(object) {
      this.globalState.pushOpenWindow(object);
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
    onClickWindow(e, window) {
      this.activateQuickSettingsMenu(false);
      console.log(window)
      // const mouseTarget = e.target.parentNode;
      // if (this.closingWindow !== true && mouseTarget.classList && mouseTarget.classList[0] !== 'window-state-control') {
      //   const windowIndex = this.globalState.openWindows.findIndex(openWindow => openWindow.name === window.name);
      //   this.globalState.openWindows.splice(windowIndex, 1);
      //   this.globalState.openWindows.push(window);
      //   this.sortWindowArray();
      // }
    },
    updateWindowDimensions() {
      this.globalState.browserWindowSize.WIDTH = this.$el.getBoundingClientRect().width;
      this.globalState.browserWindowSize.HEIGHT = this.$el.getBoundingClientRect().height;
      this.globalState.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED = this.$el.getBoundingClientRect().height - this.TASKBAR_HEIGHT;
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
    minimizeWindow(windowId) {
      const window = this.globalState.openWindows.find(window => window.id === windowId);
      const windowComponent = this.$refs[window.name][0];

      if (windowComponent) {
        windowComponent.$el.style.display = 'none';
        window.minimized = true;
      }
    },
    sortWindowArray() {
      if (this.globalState.openWindows.length > 0) {
        let counter = 2;
        this.globalState.openWindows.forEach(window => {
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
  box-sizing: border-box;
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


.quick-settings-menu {
  position: fixed;
  right: 20px;
  bottom: 60px;
  width: 350px;
}
</style>