<template>
  <div class="taskbar" ref="taskbar" :style="{ height: `${height}px` }">
    <div class="taskbar-items-left">
      <div class="app-icon" :class="iconImageName" v-for="(iconImageName, index) in applicationNames"
           :key="iconImageName"
           @mouseenter="onMouseoverApplicationIcon(iconImageName)" @mouseleave="onMouseleaveApplicationIcon">
        <div
            v-if="currentIconHover.name === iconImageName && currentIconHover.hasHoverState && openWindows.some(openWindow => openWindow.windowName === iconImageName)"
            :style="{ left: index === 0 ? '0' : (index === 1 ? '-45px' : undefined)  }"
            @mouseover.once="onMouseoverOpenWindow" @mouseleave="onMouseleaveOpenWindow"
            class="open-window-preview-wrapper">
          <div class="close-window" :style="{ visibility: isHoveringOnOpenWindowPreview ? 'visible' : 'hidden' }">
            <div class="open-window-img-name-wrapper">
              <ImgComponent :image-name="iconImageName" :custom-width="18" :custom-height="18"/>
              <div class="open-window-name">{{ iconImageName }}</div>
            </div>
            <SvgComponent :svg-type="'close'" @clicked="$emit('closeWindow', iconImageName)"/>
          </div>
          <div class="open-window-preview"></div>
        </div>
        <div>
          <ImgComponent @clicked="emitApplicationName(iconImageName)" :image-name="iconImageName" :custom-width="ICON_IMG_WIDTH"
                        :custom-height="ICON_IMG_HEIGHT"/>
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
      <div v-show="setTaskbarElementsVisibility.ARROW_OPEN_WINDOWS_BUTTON" class="show-hidden-icons-wrapper taskbar-right-item">
        <SvgComponent :svg-type="'arrowUp'" :custom-height="15" :custom-width="15"/>
      </div>
      <div v-show="setTaskbarElementsVisibility.KEYBOARD_LAYOUT_BUTTON" class="keyboard-layout-wrapper taskbar-right-item">
        <span>ENG</span>
        <span>US</span>
      </div>
      <div v-show="setTaskbarElementsVisibility.QUICK_SETTINGS_BUTTON" ref="quickSettingsMenuButton" class="wifi-sound-battery-wrapper taskbar-right-item"
           @click="emitQuickSettingMenuClicked">
        <SvgComponent :svg-type="'wifi'" :custom-height="15" :custom-width="15"/>
        <SvgComponent :svg-type="'volume'" :custom-height="15" :custom-width="15"/>
        <SvgComponent :svg-type="'battery'" :custom-height="15" :custom-width="15"/>
      </div>
      <div v-show="setTaskbarElementsVisibility.DATE_TIME_NOTIFICATION" class="date-time-notification-wrapper taskbar-right-item">
        <div class="date-time-wrapper">
          <div class="time">{{ time }}</div>
          <div class="date">{{ date }}</div>
        </div>
        <div class="notification-icon-wrapper">
          <SvgComponent svg-type="notification" :custom-width="16" :custom-height="16"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SvgComponent from "@/components/ui/svg-component";
import ImgComponent from "@/components/ui/img-component";
import json from "@/assets/json/config.json";

export default {
  name: "taskbarFooter",
  emits: ['closeWindow', 'applicationName', 'quickSettingsMenuOpen', 'hoveringOnWindowImageTaskbar', 'clicked'],
  data() {
    return {
      date: '',
      time: '',
      currentIconHover: {},
      previewImageCache: null,
      quickSettingMenuIsOpen: false,
      isHoveringOnOpenWindowImage: false,
      isHoveringOnOpenWindowPreview: false,
      ICON_IMG_WIDTH: 25,
      ICON_IMG_HEIGHT: 25,
      setTaskbarElementsVisibility: {
        DATE_TIME_NOTIFICATION: true,
        QUICK_SETTINGS_BUTTON: true,
        KEYBOARD_LAYOUT_BUTTON: true,
        ARROW_OPEN_WINDOWS_BUTTON: true
      },
      applicationNames: json.applicationNames
    };
  },
  mounted() {
    function addLeadingZero(number) {
      return ('0' + number).slice(-2);
    }

    this.previewImageCache = new Map();

    setInterval(() => {
      const now = new Date();

      this.date = `${addLeadingZero((now.getMonth() + 1))}/${addLeadingZero(now.getUTCDate())}/${now.getFullYear()}`;
      this.time = now.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true});
    }, 1000);

    const resizeObserver = new ResizeObserver(() => {
      if (this.$refs.taskbar) {
        let width = this.$refs.taskbar.offsetWidth;
        if (width < 500) {
          this.setTaskbarSmallSize();
        } else {
          this.setTaskbarNormalSize();
        }
      }
    });

    resizeObserver.observe(this.$refs.taskbar);
  },
  props: {
    openWindows: {
      type: Array,
      required: false
    },
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
      if (this.openWindows.some(window => window.windowName === name)) {
        this.isHoveringOnOpenWindowImage = true;

        this.currentIconHover = {
          name: name,
          hasHoverState: true
        }

        const cachedImage = this.previewImageCache.get(name);
        if (cachedImage) {
          this.$nextTick(() => {
            const openWindowPreview = this.$el.querySelector('.open-window-preview');
            openWindowPreview.appendChild(cachedImage);
          })
          return;
        }

        console.log('emitted')
        this.$emit('hoveringOnWindowImageTaskbar', name);
      }
    },
    onMouseleaveApplicationIcon(e) {
      if (this.isHoveringOnOpenWindowImage === true) {
        this.isHoveringOnOpenWindowImage = false;
      }

      if (e.offsetY > -1) {
        this.currentIconHover = {}
      } else {
        setTimeout(() => {
          if (!this.isHoveringOnOpenWindowPreview) {
            this.isHoveringOnOpenWindowPreview = false;
            this.currentIconHover = '';
          }
        }, 1000);
      }
    },
    onMouseoverOpenWindow() {
      this.isHoveringOnOpenWindowPreview = true;
    },
    onMouseleaveOpenWindow() {
      this.isHoveringOnOpenWindowPreview = false;
      this.currentIconHover = '';
    },
    setTaskbarSmallSize() {
      this.setTaskbarElementsVisibility.QUICK_SETTINGS_BUTTON = true;
      this.setTaskbarElementsVisibility.ARROW_OPEN_WINDOWS_BUTTON = false;
      this.setTaskbarElementsVisibility.KEYBOARD_LAYOUT_BUTTON = false;
      this.setTaskbarElementsVisibility.DATE_TIME_NOTIFICATION = false;

      this.ICON_IMG_WIDTH = 20;
      this.ICON_IMG_HEIGHT = 20;
    },
    setTaskbarNormalSize() {
      this.setTaskbarElementsVisibility.ARROW_OPEN_WINDOWS_BUTTON = true;
      this.setTaskbarElementsVisibility.KEYBOARD_LAYOUT_BUTTON = true;
      this.setTaskbarElementsVisibility.QUICK_SETTINGS_BUTTON = true;
      this.setTaskbarElementsVisibility.DATE_TIME_NOTIFICATION = true;

      this.ICON_IMG_WIDTH = 25;
      this.ICON_IMG_HEIGHT = 25;
    },
  },
  watch: {
    previewApplicationWindow(newValue) {
      const openWindowPreview = this.$el.querySelector('.open-window-preview');
      if (openWindowPreview) {
        openWindowPreview.innerHTML = '';

        newValue.style.position = 'relative';
        newValue.style.width = '100%';
        newValue.style.height = '100%';

        openWindowPreview.appendChild(newValue);
        this.previewImageCache.set(this.currentIconHover.name, newValue);
      }
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

.open-window-img-name-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.open-window-preview-wrapper {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 150px;
  width: 200px;
  padding: 10px;
  border-radius: 10px;
  background-color: var(--background-color);
  color: var(--font-color);
  bottom: 50px;
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
  z-index: 10;
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