<template>
  <footer class="taskbar"
          ref="taskbar"
          :style="{ height: `${height}px` }"
  >
    <div class="taskbar-items-left">
      <div class="app-icon"
           :class="applicationName"
           v-for="(applicationName) in applicationNames"
           :key="applicationName"
           @mouseenter="onMouseenterApplicationIcon(applicationName)"
           @mouseleave="onMouseleaveApplicationIcon"
           @click="emitApplicationName(applicationName)"
      >

        <!--START-- CONDITIONAL OPEN TABS ON TASKBAR APPLICATION HOVER -->
        <ul v-show="showOpenTabs && openTabs.some(openTab => openTab.name === applicationName)"
             class="open-tabs"
             @mouseenter="onMouseenterOpenTabs"
             @mouseleave="onMouseleaveOpenTabs"
        >
          <open-tabs :tabs="openTabs"
                     @clicked="onClickTab($event)"
                     @closed="onClickCloseTab($event)"
          />
        </ul>
        <!--END-- CONDITIONAL OPEN TABS ON TASKBAR APPLICATION HOVER -->

        <div class="img-line-wrapper">
          <ImgComponent
              :image-name="applicationName"
              :custom-width="ICON_IMG_WIDTH"
              :custom-height="ICON_IMG_HEIGHT"
          />
          <div :class="getHorizontalLineClass(applicationName)"
               :style="{ visibility: windowIsOpenByName(applicationName) ? 'visible' : 'hidden' }"
          />
        </div>
      </div>
    </div>
    <div class="taskbar-items-right">
      <div class="date-time-notification-wrapper app-icon">
        <div class="date-time-wrapper">
          <div class="time">{{ time }}</div>
          <div class="date">{{ date }}</div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import ImgComponent from "@/ui/img-component";
import json from "@/assets/json/config.json";
import {useGlobalState} from "@/stores/globalState";
import OpenTabs from "@/components/taskbar/segments/OpenTabs";

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
    this.updateDateTime();
    setInterval(() => {
      this.updateDateTime();
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
  components: {OpenTabs, ImgComponent},
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
      }).finally(() => this.showTabs(applicationName));
    },
    emitQuickSettingMenuClicked() {
      this.quickSettingMenuIsOpen = !this.quickSettingMenuIsOpen;
      this.$emit('quickSettingsMenuOpen', this.quickSettingMenuIsOpen)
    },
    getHorizontalLineClass(name) {
      let returnString = 'horizontal-line-minimized';
      this.globalState.openWindows.forEach(window => {
        if (window.name === name && window.minimized === false) {
          returnString = 'horizontal-line';
        }
      });

      return returnString;
    },
    onMouseenterApplicationIcon(name) {
      if (this.windowIsOpenByName(name)) {
        clearTimeout(this.mouseleaveTimeoutId);
        this.showTabs(name)
      }
    },
    onMouseleaveApplicationIcon() {
      clearTimeout(this.mouseleaveTimeoutId);
      this.mouseleaveTimeoutId = setTimeout(() => {
        if (this.mouseOnOpenTabs) return;
        this.removeTabs();
      }, 500);
    },
    onMouseenterOpenTabs() {
      this.showOpenTabs = true;
      this.mouseOnOpenTabs = true;
    },
    onMouseleaveOpenTabs() {
      this.showOpenTabs = false;
      this.mouseOnOpenTabs = false;
    },
    showTabs(name) {
      clearTimeout(this.mouseleaveTimeoutId);
      this.globalState.openTabsName = name;
      this.showOpenTabs = true;
    },
    removeTabs() {
      this.globalState.openTabsName = '';
      this.showOpenTabs = false;
      this.openTabs = [];
    },
    onClickTab(id) {
      const window = this.getWindowById(id);
      if (!window) return;

      this.globalState.pushToTopOpenWindows(window.id);
      this.$emit('removeMinimizeWindow', window.id);

      this.showOpenTabs = false;
    },
    onClickCloseTab(id) {
      this.globalState.closeOpenWindowByWindowId(id)
      this.showOpenTabs = false;
    },
    setOpenTabs(tabs) {
      this.openTabs = tabs.sort((a, b) => a.id - b.id);
    },
    windowIsOpenByName(name) {
      return this.globalState.openWindows.some(window => window.name === name)
    },
    getWindowById(id) {
      return this.globalState.openWindows.find(window => window.id === id)
    },
    updateDateTime() {
      function addLeadingZero(number) {
        return ('0' + number).slice(-2);
      }

      const now = new Date();
      this.date = `${addLeadingZero((now.getMonth() + 1))}/${addLeadingZero(now.getUTCDate())}/${now.getFullYear()}`;
      this.time = now.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true});
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

.open-tabs {
  position: absolute;
  display: flex;
  padding: 0;
  margin: 0;
  flex-direction: column;
  align-items: center;
  bottom: 45px;
  border: var(--border-window-color) 2px solid;
  border-radius: 10px;
  overflow: hidden;
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
  gap: 10px;
  flex-direction: row;
}

.app-icon {
  display: flex;
  padding: 2px 3px;
  transition: 0.3s;
  justify-content: center;
  align-items: center;
  position: relative;
}

.app-icon:hover {
  background-color: var(--hover-color);
  border-radius: 5px;
}

.img-line-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
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

.horizontal-line {
  width: 23px;
  padding: 1px;
  border-radius: 20px;
  background-color: var(--font-color);
  bottom: -5px;
  position: absolute;
  transition: width 0.5s;
}

.horizontal-line-minimized {
  width: 5px;
  padding: 1px;
  border-radius: 20px;
  background-color: var(--font-color);
  bottom: -5px;
  position: absolute;
  transition: width 0.5s;
}
</style>