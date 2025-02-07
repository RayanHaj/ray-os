<template>
  <footer class="taskbar" ref="taskbar" :style="{ height: `${height}px` }">
    <div class="taskbar-items-left">
      <div class="app-icons" :class="iconImageName" v-for="(iconImageName) in applicationNames" :key="iconImageName">
        <div v-show="showOpenTabs && openTabs.some(openTab => openTab.name === iconImageName)"
             class="open-tabs"
             @mouseenter="mouseOnOpenTabs = true"
             @mouseleave="onMouseleaveOpenTabs">
          <div class="open-tab" @click="onClickTab(tab.id)" v-for="tab in openTabs" :key="tab.id">
            <div class="open-tab-name">
              {{ tab.name }} {{ tab.id }}
            </div>
            <div class="open-tab-close" @click="onClickTabClose(tab.id)">
              <svg-component svg-type="close" :custom-width="18" :custom-height="18"/>
            </div>
          </div>
        </div>
        <div class="app-icon"
             @mouseenter="onMouseenterApplicationIcon(iconImageName)"
             @mouseleave="onMouseleaveApplicationIcon"
             @click="emitApplicationName(iconImageName)"
        >
          <ImgComponent :image-name="iconImageName"
                        :custom-width="ICON_IMG_WIDTH"
                        :custom-height="ICON_IMG_HEIGHT"/>
          <div :class="getHorizontalLineClass(iconImageName)"
               :style="{ visibility: this.globalState.openWindows.some(openWindow => openWindow.name === iconImageName) ? 'visible' : 'hidden' }"
          />
        </div>
      </div>
    </div>
    <div class="taskbar-items-right">
      <div v-show="setTaskbarElementsVisibility.ARROW_OPEN_WINDOWS_BUTTON"
           class="show-hidden-icons-wrapper taskbar-right-item">
        <SvgComponent :svg-type="'arrowUp'" :custom-height="15" :custom-width="15"/>
      </div>
      <div v-show="setTaskbarElementsVisibility.KEYBOARD_LAYOUT_BUTTON"
           class="keyboard-layout-wrapper taskbar-right-item">
        <span>ENG</span>
        <span>US</span>
      </div>
      <div v-show="setTaskbarElementsVisibility.QUICK_SETTINGS_BUTTON" ref="quickSettingsMenuButton"
           class="wifi-sound-battery-wrapper taskbar-right-item"
           @click="emitQuickSettingMenuClicked">
        <SvgComponent :svg-type="'wifi'" :custom-height="15" :custom-width="15"/>
        <SvgComponent :svg-type="'volume'" :custom-height="15" :custom-width="15"/>
        <SvgComponent :svg-type="'battery'" :custom-height="15" :custom-width="15"/>
      </div>
      <div v-show="setTaskbarElementsVisibility.DATE_TIME_NOTIFICATION"
           class="date-time-notification-wrapper taskbar-right-item">
        <div class="date-time-wrapper">
          <div class="time">{{ time }}</div>
          <div class="date">{{ date }}</div>
        </div>
        <div class="notification-icon-wrapper">
          <SvgComponent svg-type="notification" :custom-width="16" :custom-height="16"/>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import SvgComponent from "@/ui/svg-component";
import ImgComponent from "@/ui/img-component";
import json from "@/assets/json/config.json";
import {useGlobalState} from "@/stores/globalState";

export default {
  name: "taskbarFooter",
  emits: ['closeWindow', 'quickSettingsMenuOpen', 'hoveringOnWindowImageTaskbar', 'clicked', 'removeMinimizeWindow'],
  inject: ['db'],
  data() {
    return {
      date: '',
      time: '',
      quickSettingMenuIsOpen: false,
      ICON_IMG_WIDTH: 25,
      ICON_IMG_HEIGHT: 25,
      openTabs: [],
      mouseoverTimeoutId: null,
      mouseleaveTimeoutId: null,
      showOpenTabs: false,
      mouseOnOpenTabs: false,
      setTaskbarElementsVisibility: {
        DATE_TIME_NOTIFICATION: true,
        QUICK_SETTINGS_BUTTON: true,
        KEYBOARD_LAYOUT_BUTTON: true,
        ARROW_OPEN_WINDOWS_BUTTON: true
      },
      applicationNames: json.defaultApplicationNames,
      showWindowsPreview: false
    };
  },
  computed: {
    globalState() {
      return useGlobalState();
    }
  },
  mounted() {
    function addLeadingZero(number) {
      return ('0' + number).slice(-2);
    }

    setInterval(() => {
      const now = new Date();

      this.date = `${addLeadingZero((now.getMonth() + 1))}/${addLeadingZero(now.getUTCDate())}/${now.getFullYear()}`;
      this.time = now.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true});
    }, 1000);
  },
  props: {
    height: {
      type: Number,
      required: true
    },
    previewApplicationWindow: {
      type: HTMLCanvasElement,
      required: false
    }
  },
  components: {ImgComponent, SvgComponent},
  watch: {
    'globalState.openTabs': {
      handler(newValue) {
        this.setOpenTabs(newValue);
      },
    }
  },
  methods: {
    emitApplicationName(applicationName) {
      if (applicationName === undefined) {
        return;
      }

      if (this.globalState.openWindows.some(window => window.name === applicationName)) {
        this.showOpenTabs = true;
        return;
      }

      this.db.getElementByName('files', applicationName).then(element => {
        this.globalState.pushOpenWindow(element);
      });
    },
    emitQuickSettingMenuClicked() {
      this.quickSettingMenuIsOpen = !this.quickSettingMenuIsOpen;
      this.$emit('quickSettingsMenuOpen', this.quickSettingMenuIsOpen)
    },
    getHorizontalLineClass(name) {
      let counter = 0;
      this.globalState.openWindows.forEach(window => {
        if (window.name === name && window.minimized === false) {
          counter += 1;
        }
      });

      if (counter === 0) {
        return 'horizontal-line-minimized';
      }

      return 'horizontal-line';
    },
    onMouseenterApplicationIcon(name) {
      if (this.globalState.openTabsName !== '') return;
      this.globalState.openTabsName = name;

      if (this.mouseleaveTimeoutId) {
        clearTimeout(this.mouseleaveTimeoutId);
        this.mouseleaveTimeoutId = null;
      }

      if (this.mouseoverTimeoutId === null) {
        this.mouseoverTimeoutId = setTimeout(() => {
          this.showOpenTabs = true;
        }, 500);
      }
    },
    onMouseleaveApplicationIcon() {
      clearTimeout(this.mouseoverTimeoutId);
      this.mouseoverTimeoutId = null;

      this.mouseleaveTimeoutId = setTimeout(() => {
        if (this.mouseOnOpenTabs === true) return;
        this.globalState.openTabsName = '';
        this.showOpenTabs = false;
        this.openTabs = [];
      }, 500);
    },
    onMouseleaveOpenTabs() {
      if (this.showOpenTabs === true) {
        this.showOpenTabs = false;
      }
      this.mouseOnOpenTabs = false;
    },
    onClickTab(id) {
      const window = this.globalState.openWindows.find(window => window.id === id);
      if (!window) return;

      this.globalState.pushToTopOpenWindows(window.id);
      this.$emit('removeMinimizeWindow', window.id);

      this.showOpenTabs = false;
    },
    onClickTabClose(id) {
      this.globalState.openWindows.splice(id, 1);
      this.showOpenTabs = false;
    },
    setOpenTabs(tabs) {
      this.openTabs = tabs.sort((a, b) => a.id - b.id);
    }
  },
}
</script>

<style scoped>
@font-face {
  font-family: 'Segoe UI Variable';
  src: url('@/assets/fonts/Segoe-UI-Variable-Static-Text.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}

* {
  font-family: 'Segoe UI Variable', serif;
  font-size: small;
  color: var(--font-color);
  user-select: none;
}

.open-window-img-name-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.open-tabs {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  bottom: 45px;
  z-index: 9999;
  border: var(--border-window-color) 2px solid;
  border-radius: 10px;
  overflow: hidden;
}

.open-tab {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 10px;
  font-size: 11px;
  width: 130px;
  background-color: var(--background-color);
  color: var(--font-color);
}

.open-tab:hover {
  background-color: var(--hover-color);
}

.open-tab-close {
  padding-top: 5px;
}

.open-window-preview {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 200px;
  overflow: hidden;
}

.close-window {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  align-self: end;
}

.open-window-name {
  font-size: 10px;
  font-style: italic;
  font-weight: bolder;
}

.taskbar {
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: var(--taskbar-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 9999;
}

.taskbar-items-left {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 10px;
}

.taskbar-items-right {
  margin-right: 8px;
  display: flex;
  flex-direction: row;
}

.taskbar-right-item {
  padding: 4px 8px 4px 8px;
  transition: 0.3s;
  cursor: default;
}

.taskbar-right-item:hover {
  background-color: var(--hover-color);
  border-radius: 5px;
}

.app-icons {
  display: flex;
  padding: 5px 6px 0;
  transition: 0.3s;
  justify-content: center;
  position: relative;
}

.app-icons:hover {
  background-color: var(--hover-color);
  border-radius: 5px;
}

.date-time-notification-wrapper {
  display: flex;
  flex-direction: row;
}

.date-time-wrapper {
  display: flex;
  flex-direction: column;
  align-items: end;
}

.notification-icon-wrapper {
  align-self: center;
  margin-left: 7px;
}

.wifi-sound-battery-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 3px;
}

.keyboard-layout-wrapper {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.show-hidden-icons-wrapper {
  align-self: center;
  margin-right: 3px;
  padding-top: 10px;
  padding-bottom: 10px;
}

.horizontal-line {
  width: 23px;
  padding: 1px;
  border-radius: 20px;
  background-color: var(--font-color);
  bottom: -1px;
  position: absolute;
  transition: width 0.5s;
}

.horizontal-line-minimized {
  display: flex;
  width: 5px;
  padding: 1px;
  border-radius: 20px;
  background-color: var(--font-color);
  bottom: -1px;
  position: absolute;
  left: 14px;
  transition: width 0.5s;
}
</style>