<template>
  <footer class="taskbar"
          ref="taskbar"
          :style="{ height: `${height}px` }"
  >
    <div class="taskbar-items-left">
      <div class="app-icon">
        <ImgComponent
            image-name="home"
            :custom-width="ICON_IMG_WIDTH"
            :custom-height="ICON_IMG_HEIGHT"
        />
      </div>
    </div>
    <div class="taskbar-items-middle">
      <div class="app-icon"
           :class="applicationName"
           v-for="(applicationName, index) in applicationNames"
           :key="applicationName"
           @mouseenter="onMouseenterApplicationIcon(applicationName)"
           @mouseleave="onMouseleaveApplicationIcon"
           @click="emitApplicationName(applicationName)"
      >

        <div v-show="showOpenTabs && openTabs.some(openTab => openTab.name === applicationName)"
             class="open-tabs"
             @mouseenter="onMouseenterOpenTabs(applicationName)"
             @mouseleave="onMouseleaveOpenTabs"
        >
          <open-tabs :tabs="openTabs"
                     :isFirstItem="index === 0"
                     @clicked="onClickTab($event)"
                     @closed="onClickCloseTab($event)"
          />
        </div>

        <div class="image-wrapper">
          <ImgComponent
              :image-name="applicationName"
              :custom-width="ICON_IMG_WIDTH"
              :custom-height="ICON_IMG_HEIGHT"
          />
          <!-- Image underline -->
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
import {useWindowStore} from "@/stores/globalState";
import OpenTabs from "@/components/taskbar/segments/OpenTabs";
import {mapStores} from "pinia";

export default {
  name: "taskbarFooter",
  emits: ['closeWindow', 'quickSettingsMenuOpen', 'hoveringOnWindowImageTaskbar', 'clicked', 'removeMinimizeWindow'],
  inject: ['db'],
  data() {
    return {
      date: '',
      time: '',
      quickSettingMenuIsOpen: false,
      ICON_IMG_WIDTH: 35,
      ICON_IMG_HEIGHT: 35,
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
    ...mapStores(useWindowStore)
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
    }
  },
  components: {OpenTabs, ImgComponent},
  watch: {
    'windowStore.openTabs': {
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

      if (this.windowIsOpenByName(applicationName)) {
        this.showTabs(applicationName);
        return;
      }

      this.db.getElementByName('files', applicationName).then(element => {
        this.windowStore.pushOpenWindow(element);
      }).finally(() => this.showTabs(applicationName));
    },
    getHorizontalLineClass(name) {
      return this.windowStore.openWindows.some(window => window.name === name && !window.minimized) ?
          'horizontal-line' : 'horizontal-line-minimized';
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
    onMouseenterOpenTabs(applicationName) {
      this.showTabs(applicationName)
      this.mouseOnOpenTabs = true;
    },
    onMouseleaveOpenTabs() {
      this.removeTabs();
      this.mouseOnOpenTabs = false;
    },
    showTabs(name) {
      clearTimeout(this.mouseleaveTimeoutId);
      this.windowStore.openTabsName = name;
      this.showOpenTabs = true;
    },
    removeTabs() {
      this.windowStore.openTabsName = '';
      this.showOpenTabs = false;
      this.openTabs = [];
    },
    onClickTab(id) {
      if (!this.windowIsOpenById(id)) return;

      this.windowStore.pushToTopOpenWindows(id);
      this.$emit('removeMinimizeWindow', id);

      this.removeTabs();
    },
    onClickCloseTab(id) {
      this.windowStore.playCloseAnimation = {
        id: id,
        value: true
      };
      this.removeTabs();
    },
    setOpenTabs(tabs) {
      this.openTabs = tabs.sort((a, b) => a.id - b.id);
    },
    windowIsOpenById(id) {
      return this.windowStore.openWindows.some(window => window.id === id);
    },
    windowIsOpenByName(name) {
      return this.windowStore.openWindows.some(window => window.name === name)
    },
    updateDateTime() {
      function addLeadingZero(number) {
        return ('0' + number).slice(-2);
      }

      const date = new Date();
      this.date = `${addLeadingZero((date.getMonth() + 1))}/${addLeadingZero(date.getUTCDate())}/${date.getFullYear()}`;
      this.time = date.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true});
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
  padding-left: 8px;
}

.taskbar-items-middle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.taskbar-items-right {
  padding-right: 8px;
  display: flex;
  gap: 10px;
  flex-direction: row;
}

.app-icon {
  display: flex;
  padding: 5px;
  transition: 0.2s;
  justify-content: center;
  align-items: center;
  position: relative;
}

.app-icon:hover {
  background-color: var(--hover-color);
  border-radius: 5px;
  padding: 5px;
}

.image-wrapper {
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