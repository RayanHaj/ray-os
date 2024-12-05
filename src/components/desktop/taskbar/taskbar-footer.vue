<template>
  <div class="taskbar" :style="{ height: `${height}px` }">
    <div class="taskbar-items-left">
      <div class="app-icon" :class="iconImageName" v-for="(iconImageName, index) in applicationNames"
           :key="iconImageName"
           @mouseover="onMouseoverApplicationIcon(iconImageName)" @mouseleave="onMouseleaveApplicationIcon">
        <div
            v-if="currentIconHover.name === iconImageName && currentIconHover.hasHoverState && openWindows.some(openWindow => openWindow.windowName === iconImageName)"
            :style="{ left: index === 0 ? '0' : (index === 1 ? '-45px' : undefined)  }"
            @mouseover="onMouseoverOpenWindow" @mouseleave="onMouseleaveOpenWindow"
            class="open-window-preview">
          <div class="close-window" :style="{ visibility: isHoveringOnOpenWindow ? 'visible' : 'hidden' }">
            <SvgComponent :svg-type="'close'" @clicked="$emit('closeWindow', iconImageName)"></SvgComponent>
          </div>
          <div class="open-window-name">
            {{ iconImageName }}
          </div>
          <div>
            {{ iconImageName }} is open
          </div>
        </div>
        <div>
          <svg-component @clicked="emitApplicationName(iconImageName)" :svg-type="iconImageName.toLowerCase()" :custom-width="25" :custom-height="25"></svg-component>
          <div :class="openWindows.find(openWindow => openWindow.windowName === iconImageName) &&
                       openWindows.find(openWindow => openWindow.windowName === iconImageName).minimized === true ?
                       'horizontal-line-minimized' :
                       'horizontal-line'"
               :style="{ visibility: openWindows.some(openWindow => openWindow.windowName === iconImageName) ?
               'visible' :
               'hidden' }"
          />
        </div>
      </div>
    </div>
    <div class="taskbar-items-right">
      <div class="show-hidden-icons-wrapper taskbar-right-item">
        <SvgComponent :svg-type="'arrowUp'" :custom-height="15" :custom-width="15"></SvgComponent>
      </div>
      <div class="keyboard-layout-wrapper taskbar-right-item">
        <span>ENG</span>
        <span>US</span>
      </div>
      <div ref="quickSettingsMenuButton" class="wifi-sound-battery-wrapper taskbar-right-item"
           @click="emitQuickSettingMenuClicked">
        <SvgComponent :svg-type="'wifi'" :custom-height="15" :custom-width="15"></SvgComponent>
        <SvgComponent :svg-type="'volume'" :custom-height="15" :custom-width="15"></SvgComponent>
        <SvgComponent :svg-type="'battery'" :custom-height="15" :custom-width="15"></SvgComponent>
      </div>
      <div class="date-time-notification-wrapper taskbar-right-item">
        <div class="date-time-wrapper">
          <div class="time">{{ time }}</div>
          <div class="date">{{ date }}</div>
        </div>
        <div class="notification-icon-wrapper">
          <SvgComponent class="notification-icon-wrapper" svg-type="notification" :custom-width="16" :custom-height="16"></SvgComponent>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SvgComponent from "@/components/ui/svg-component";
import json from "@/assets/json/config.json"

export default {
  name: "taskbarFooter",
  data() {
    return {
      date: '',
      time: '',
      currentIconHover: {},
      quickSettingMenuIsOpen: false,
      isHoveringOnOpenWindow: false,
      applicationNames: json.applicationNames
    };
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
    openWindows: {
      type: Array,
      required: false
    },
    height: {
      type: Number,
      required: true
    }
  },
  components: { SvgComponent },
  methods: {
    emitApplicationName(applicationName) {
      this.$emit('applicationName', applicationName)
    },
    emitQuickSettingMenuClicked() {
      this.quickSettingMenuIsOpen = !this.quickSettingMenuIsOpen;
      this.$emit('quickSettingsMenuOpen', this.quickSettingMenuIsOpen)
    },
    getRefQuickSettingsMenuButton() {
      return this.$refs.quickSettingsMenuButton;
    },
    onMouseoverApplicationIcon(name) {
      if (name === 'windows-start') {
        this.currentIconHover = {
          name: name,
          hasHoverState: false
        }
        return;
      }

      this.currentIconHover = {
        name: name,
        hasHoverState: true
      }
    },
    onMouseleaveApplicationIcon(e) {
      if (e.offsetY > -1) {
        this.currentIconHover = {}
      } else {
        setTimeout(() => {
          if (!this.isHoveringOnOpenWindow) {
            this.isHoveringOnOpenWindow = false;
            this.currentIconHover = '';
          }
        }, 1000);
      }
    },
    onMouseoverOpenWindow() {
      this.isHoveringOnOpenWindow = true;
    },
    onMouseleaveOpenWindow() {
      this.isHoveringOnOpenWindow = false;
      this.currentIconHover = '';
    }
  }
}
</script>

<style scoped>
@font-face {
  font-family: 'Segoe UI Variable';
  src: url('@/assets/fonts/Segoe-UI-Variable-Static-Text.ttf') format('truetype'); /* Use the correct path */
  font-weight: 400; /* Default weight */
  font-style: normal; /* Normal style */
}

* {
  font-family: 'Segoe UI Variable', serif;
  font-size: small;
  color: var(--font-color);
  user-select: none;
}

.open-window-preview {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 150px;
  width: 200px;
  padding: 10px;
  border-radius: 10px;
  background-color: var(--background-color);
  color: var(--font-color);
  bottom: 50px;
}

.close-window {
  align-self: end;
}

.open-window-name {
  font-size: 27px;
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

.app-icon {
  display: flex;
  padding: 5px 6px 0;
  transition: 0.3s;
  justify-content: center;
  position: relative;
}

.app-icon:hover {
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