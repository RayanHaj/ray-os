<template>
  <div class="movable-window" @mousemove="mouseOverEventListeners" @mousedown="moveWindowOnMouseDownWindowCorners">
    <div class="window-header">
      <div class="top-header" @mousedown="moveWindowOnMouseDownHeader">
        <div class="window-name">
          {{ windowName }}
        </div>
        <div class="window-state-control">
          <!--window minimize-->
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 512 512" @click="minimizeWindow">
            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <path fill="#ffffff"
                  d="M32 416c-17.7 0-32 14.3-32 32s14.3 32 32 32l448 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 416z"/>
          </svg>

          <!--window maximize-->
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 512 512" @click="maximizeWindow">
            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <path fill="#ffffff"
                  d="M432 64L208 64c-8.8 0-16 7.2-16 16l0 16-64 0 0-16c0-44.2 35.8-80 80-80L432 0c44.2 0 80 35.8 80 80l0 224c0 44.2-35.8 80-80 80l-16 0 0-64 16 0c8.8 0 16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zM0 192c0-35.3 28.7-64 64-64l256 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 192zm64 32c0 17.7 14.3 32 32 32l192 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 192c-17.7 0-32 14.3-32 32z"/>
          </svg>

          <!--window close-->
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 384 512"
               @click="$emit('closeTab', windowName)">
            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <path fill="#ffffff"
                  d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
          </svg>
        </div>
      </div>
    </div>
    <div class="window-content">
      <FileExplorer v-if="windowName === 'file-explorer'"/>
      <SettingsWindow v-if="windowName === 'settings'" @theme-changed="$emit('themeChanged')"/>
      <WelcomeWindow v-if="windowName === 'welcome-window'"/>
    </div>
  </div>
</template>

<script>
import FileExplorer from "@/components/desktopComponents/draggableWindows/fileExplorer/file-explorer";
import SettingsWindow from "@/components/desktopComponents/draggableWindows/settingsWindow/settings-window";
import WelcomeWindow from "@/components/desktopComponents/draggableWindows/welcomeWindow/welcome-window";
export default {
  name: "main-window",
  beforeMount() {
    this.$emit('rendered');
  },

  components: {WelcomeWindow, SettingsWindow, FileExplorer},

  mounted() {
    if (this.windowName === 'welcome-window') {
      this.maximizeWindow();
    }
  },
  data() {
    return {
      MAXIMUM_WIDTH: '',
      MAXIMUM_HEIGHT: '',
      tabsWrapperElement: null,
    }
  },
  props: {
    windowSize: {
      type: Array,
      required: false
    },
    windowName: {
      type: String,
      required: true
    }
  },
  watch: {
    windowSize(newSize) {
      this.MAXIMUM_WIDTH = newSize[0];
      this.MAXIMUM_HEIGHT = newSize[1];
    },
  },
  methods: {
    maximizeWindow() {
      let windowElement = document.querySelector('.movable-window');
      let computedStyles = window.getComputedStyle(windowElement);
      let windowWidth = this.convertFromPixelStringToNumber(computedStyles.width);
      let windowHeight = this.convertFromPixelStringToNumber(computedStyles.height);

      if ((windowWidth === this.MAXIMUM_WIDTH || windowWidth + 1 === this.MAXIMUM_WIDTH || windowWidth - 1 === this.MAXIMUM_WIDTH) && windowHeight >= this.MAXIMUM_HEIGHT) {
        windowElement.style.width = '60%';
        windowElement.style.height = '80%';
        return;
      }

      if (windowWidth !== this.MAXIMUM_WIDTH || windowHeight !== this.MAXIMUM_HEIGHT) {
        windowElement.style.width = '100%';
        windowElement.style.height = '100%';

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const newX = (viewportWidth - windowElement.offsetWidth) / 2;
        const newY = (viewportHeight - windowElement.offsetHeight) / 2;

        windowElement.style.left = `${newX}px`;
        windowElement.style.top = `${newY}px`;
      }
    },

    minimizeWindow() {
      // let windowElement = document.querySelector('.movable-window');
      // windowElement.style.display = 'none';

      this.$emit('minimizeWindow', this.windowName);
    },

    convertFromPixelStringToNumber(string) {
      let number = '';
      for (let index in string) {
        const letter = string[index];
        if (letter === '.' || letter === 'p') {
          break;
        }
        number += letter;
      }
      return Number(number);
    },
    mouseOverEventListeners(event) {
      event.preventDefault();

      let oldPositionX = event.clientX;
      let oldPositionY = event.clientY;
      let windowElement = event.target.closest('.movable-window');
      let windowWidth = windowElement.getBoundingClientRect().width;
      let windowHeight = windowElement.getBoundingClientRect().height;
      let mousePositionX = oldPositionX - windowElement.getBoundingClientRect().x;
      let mousePositionY = oldPositionY - windowElement.getBoundingClientRect().y;

      const WINDOW_MOVE_AREA_SPACE = 3;

      let mouseOnResizeSpace = false;

      if (mousePositionX + WINDOW_MOVE_AREA_SPACE >= windowWidth) {
        windowElement.style.cursor = 'e-resize';
        mouseOnResizeSpace = true;
      }

      if (mousePositionX - WINDOW_MOVE_AREA_SPACE <= 0) {
        windowElement.style.cursor = 'w-resize';
        mouseOnResizeSpace = true;
      }

      if (mousePositionY + WINDOW_MOVE_AREA_SPACE >= windowHeight) {
        windowElement.style.cursor = 'n-resize';
        mouseOnResizeSpace = true;
      }

      if (mousePositionY - WINDOW_MOVE_AREA_SPACE <= 0) {
        windowElement.style.cursor = 's-resize';
        mouseOnResizeSpace = true;
      }

      if (!mouseOnResizeSpace) {
        windowElement.style.cursor = 'auto';
        mouseOnResizeSpace = false;
      }
    },
    moveWindowOnMouseDownWindowCorners(event) {
      let oldPositionX = event.clientX;
      let oldPositionY = event.clientY;
      let windowElement = event.target.closest('.movable-window');
      let windowWidth = windowElement.getBoundingClientRect().width;
      let windowHeight = windowElement.getBoundingClientRect().height;
      let windowLeft = windowElement.getBoundingClientRect().left;
      let windowTop = windowElement.getBoundingClientRect().top;
      let mousePositionX = oldPositionX - windowElement.getBoundingClientRect().x;
      let mousePositionY = oldPositionY - windowElement.getBoundingClientRect().y;

      const WINDOW_MOVE_AREA_SPACE = 3;

      if (mousePositionX + WINDOW_MOVE_AREA_SPACE >= windowWidth) {
        eventListenersRightSideWindow();
      }

      if (mousePositionX - WINDOW_MOVE_AREA_SPACE <= 0) {
        eventListenersLeftSideWindow();
      }

      if (mousePositionY + WINDOW_MOVE_AREA_SPACE >= windowHeight) {
        eventListenersBottomSideWindow();
      }

      if (mousePositionY - WINDOW_MOVE_AREA_SPACE <= 0) {
        eventListenersTopSideWindow();
      }

      function eventListenersRightSideWindow() {
        const onMouseMove = (event) => {
          event.preventDefault();
          windowElement.style.width = `${(windowWidth - (oldPositionX - event.clientX))}px`;
        }

        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }

      function eventListenersLeftSideWindow() {
        const onMouseMove = (event) => {
          event.preventDefault();
          const widthChange = windowLeft - event.clientX;
          const newWidth = windowWidth + widthChange;
          windowElement.style.width = `${newWidth}px`
          windowElement.style.left = `${event.clientX}px`
        }

        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }

      function eventListenersBottomSideWindow() {
        const onMouseMove = (event) => {
          event.preventDefault();
          windowElement.style.height = `${(windowHeight - (oldPositionY - event.clientY))}px`
        }

        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }

      function eventListenersTopSideWindow() {
        const onMouseMove = (event) => {
          event.preventDefault();
          const heightChange = windowTop - event.clientY;
          const newHeight = windowHeight + heightChange;
          windowElement.style.height = `${newHeight}px`
          windowElement.style.top = `${event.clientY}px`
        }

        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }
    },

    moveWindowOnMouseDownHeader(event) {
      event.preventDefault();
      let windowElement = event.target.closest('.movable-window');
      const windowElementStyles = window.getComputedStyle(windowElement);

      let yOutOfBoundsPositive = false;
      let yOutOfBoundsNegative = false;

      const NUM_MAXIMUM_WIDTH = this.MAXIMUM_WIDTH;
      const NUM_MAXIMUM_HEIGHT = this.MAXIMUM_HEIGHT;
      const NUM_WIDTH = this.convertFromPixelStringToNumber(windowElementStyles.width);
      const NUM_HEIGHT = this.convertFromPixelStringToNumber(windowElementStyles.height);

      let prevX = event.clientX;
      let prevY = event.clientY;

      const onMouseMove = (event) => {
        if ((NUM_WIDTH === NUM_MAXIMUM_WIDTH || NUM_WIDTH + 1 === NUM_MAXIMUM_WIDTH || NUM_WIDTH - 1 === NUM_MAXIMUM_WIDTH) && (NUM_HEIGHT === NUM_MAXIMUM_HEIGHT || (NUM_HEIGHT - 45) === NUM_MAXIMUM_HEIGHT)) {
          windowElement.style.left = `${prevX - (NUM_WIDTH / 2 - 250)}px`;
          windowElement.style.top = `${prevY}px`;
          windowElement.style.width = '60%';
          windowElement.style.height = '80%';
        }

        const newX = event.clientX;
        const newY = event.clientY;

        yOutOfBoundsPositive = newX >= NUM_MAXIMUM_WIDTH - 1;
        yOutOfBoundsNegative = newX <= 1;

        const deltaX = newX - prevX;
        const deltaY = newY - prevY;

        windowElement.style.left = `${windowElement.offsetLeft + deltaX}px`;
        windowElement.style.top = `${windowElement.offsetTop + deltaY}px`;

        prevX = newX;
        prevY = newY;
      };

      const onMouseUp = () => {
        if (yOutOfBoundsPositive) {
          windowElement.style.left = '50%';
          windowElement.style.width = '50%';
          windowElement.style.height = '100%';
          windowElement.style.top = 0;
        }
        if (yOutOfBoundsNegative) {
          windowElement.style.left = 0;
          windowElement.style.width = '50%';
          windowElement.style.height = '100%';
          windowElement.style.top = 0;
        }
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
  }
}
</script>

<style scoped>
@font-face {
  font-family: 'Segoe UI Variable';
  src: url('@/assets/fonts/Segoe-UI-Variable-Static-Text.ttf') format('truetype'); /* Use the correct path */
  font-weight: 600; /* Default weight */
  font-style: normal; /* Normal style */
}

* {
  font-family: 'Segoe UI Variable', serif;
  font-size: small;
  color: white;
}

.movable-window {
  width: 100%;
  height: 100%;
  resize: both;
  overflow: auto;
  position: relative;
  background-color: var(--background-color-window);
  border: black 1px solid;
}

.window-header {
  height: 50px;
  position: sticky;
  top: 0;
}

.top-header {
  display: flex;
  flex-direction: row;
  gap: 20px;
  justify-content: space-between;
  margin-top: 3px;
}

.window-name {
  font-size: 25px;
  font-weight: bold;
  margin-left: 10px;
}

.window-state-control {
  display: flex;
  flex-direction: row;
  gap: 10px;
  padding: 10px;
}
</style>