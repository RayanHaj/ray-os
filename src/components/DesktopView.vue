<template>
  <div class="desktop"
       ref="desktop"
       :style="{ filter: `brightness(${desktopBrightnessValue}%)`}">
    <OsLoader v-if="osLoaderFinished === false && this.globalState.DISABLE_START_ANIMATION === false" @finished="osLoaderFinished = true"/>
    <div v-show="osLoaderFinished === true || this.globalState.DISABLE_START_ANIMATION === true" class="main-screen">
      <MainWindow
          v-for="window in this.globalState.openWindows"
          :key="window.id"
          class="window"
          :ref="window.id"
          :id="window.id"
          :window-id="window.id"
          :window-size="windowDimensions"
          :split-other-window="splitOtherWindow"
          :taskbar-height="TASKBAR_HEIGHT"
          @clicked="onClickWindow($event, window)"
          @rendered="windowIsRendered = !windowIsRendered"
          @minimize-window="minimizeWindow"
          @split-other-window="splitOtherWindow = $event"
          @window-resizing="windowIsResizing = $event"
      />
      <transition name="slide">
        <DesktopGrid v-show="osLoaderFinished === true || this.globalState.DISABLE_START_ANIMATION === true"
            @clicked="activateQuickSettingsMenu(false)"
            :window-resizing="windowIsResizing"
            class="desktop-grid"/>
      </transition>
    </div>
    <div v-show="osLoaderFinished === true || this.globalState.DISABLE_START_ANIMATION === true" class="footer-container">
      <SettingsMenu v-show="quickSettingMenuIsOpen"
                    ref="settingsMenu"
                    class="quick-settings-menu"
                    @brightness-value-changed="updateBrightnessValue"
      />
      <taskbar ref="taskbar"
               class="taskbar"
               @quick-settings-menu-open="activateQuickSettingsMenu(true)"
               @remove-minimize-window="minimizeWindow"
               :height="TASKBAR_HEIGHT"
               :preview-application-window="previewApplicationWindow"
      />
    </div>
  </div>
</template>

<script>
import Taskbar from "@/components/taskbar/TaskbarMain";
import Loader from "@/components/DesktopLoader";
import Window from "@/components/window/WindowMain";
import DesktopGrid from "@/components/DesktopGrid";
import QuickSettings from "@/components/taskbar/segments/QuickSettings";
import { useGlobalState } from "@/stores/globalState";
import { deviceIsMobile } from "@/utils/util";

export default {
  name: "DesktopView",
  data() {
    return {
      TASKBAR_HEIGHT: 44,
      windowIsRendered: false,
      windowIsResizing: false,
      quickSettingMenuIsOpen: false,
      closingWindow: false,
      previewApplicationWindow: null,
      applicationName: '',
      splitOtherWindow: {},
      openWindows: [],
      windowDimensions: [],
      backgroundColor: 'black',
      desktopBrightnessValue: 100,
      osLoaderFinished: false
    }
  },
  components: {
    SettingsMenu: QuickSettings,
    MainWindow: Window,
    DesktopGrid: DesktopGrid,
    taskbar: Taskbar,
    OsLoader: Loader
  },
  props: {
    backgroundImageId: Number
  },
  emits: ['clicked'],
  mounted() {
    if (deviceIsMobile() === true) {
      this.$router.push('/');
    }

    this.init();
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
    'globalState.startBlockGame'(newValue) {
      console.log(newValue)
      this.startBlockGame = this.globalState.startBlockGame;
    },
    'globalState.openWindows.length'(newValue, oldValue) {
      if (newValue > oldValue) {
        const newElement = this.globalState.openWindows[this.globalState.openWindows.length - 1];
        this.$nextTick(() => {
            const windowElement = this.$refs[newElement.id][0];
          if (Number(windowElement.$el.id) === newElement.id) {
            windowElement.$el.style.height = `calc(100% - ${this.TASKBAR_HEIGHT}px)`;
            windowElement.$el.style.display = 'flex';
            newElement.minimized = false;
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
    init() {
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
    onClickWindow() {
      this.activateQuickSettingsMenu(false);
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
      const windowComponent = this.$refs[windowId][0];

      if (!windowComponent || !window) {
        return;
      }

      if (windowComponent.$el.style.display === 'none' && window.minimized === true) {
        windowComponent.$el.style.display = 'block';
        window.minimized = false;
        return;
      }

      windowComponent.$el.style.display = 'none';
      window.minimized = true;
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
  z-index: 0;
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

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}
</style>