<template>
  <div class="movable-window"
       @mousemove="mouseOverEventListeners"
       @mousedown="moveWindowOnMouseDownWindowCorners">
    <div class="window-header">
      <div class="top-header" @mousedown.prevent="onMouseDownHeader($event)">
        <div class="window-name"> {{ windowName }}</div>
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
  components: {WelcomeWindow, SettingsWindow, FileExplorer},
  data() {
    return {
      MAXIMUM_WIDTH: '',
      MAXIMUM_HEIGHT: '',
      WINDOW_MOVE_AREA_SPACE: 6,
      tabsWrapperElement: null,
      moveWindowVariables: {
        yOutOfBoundsPositive: false,
        yOutOfBoundsNegative: false,
        NUM_WIDTH: 0,
        NUM_HEIGHT: 0,
        prevX: 0,
        prevY: 0,
      },
      mouseOverWindowVariables: {
        oldPositionX: 0,
        oldPositionY: 0,
        windowWidth: 0,
        windowHeight: 0,
        mousePositionX: 0,
        mousePositionY: 0,
        mouseOnResizeSpace: false,
      },
      mouseDownWindowVariables: {
        oldPositionX: 0,
        oldPositionY: 0,
        windowWidth: 0,
        windowHeight: 0,
        windowLeft: 0,
        windowTop: 0,
        mousePositionX: 0,
        mousePositionY: 0,
      }
    }
  },
  beforeMount() {
    this.$emit('rendered');
  },
  mounted() {
    if (this.windowName === 'welcome-window') {
      this.maximizeWindow();
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
      let computedStyles = window.getComputedStyle(this.$el);
      let windowWidth = this.convertFromPixelStringToNumber(computedStyles.width);
      let windowHeight = this.convertFromPixelStringToNumber(computedStyles.height);

      if ((windowWidth === this.MAXIMUM_WIDTH || windowWidth + 1 === this.MAXIMUM_WIDTH || windowWidth - 1 === this.MAXIMUM_WIDTH) && windowHeight >= this.MAXIMUM_HEIGHT) {
        this.$el.style.width = '60%';
        this.$el.style.height = '80%';
        return;
      }

      if (windowWidth !== this.MAXIMUM_WIDTH || windowHeight !== this.MAXIMUM_HEIGHT) {
        this.$el.style.width = '100%';
        this.$el.style.height = '100%';

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const newX = (viewportWidth - this.$el.offsetWidth) / 2;
        const newY = (viewportHeight - this.$el.offsetHeight) / 2;

        this.$el.style.left = `${newX}px`;
        this.$el.style.top = `${newY}px`;
      }
    },
    mouseOverEventListeners(event) {
      event.preventDefault();

      this.mouseOverWindowVariables.oldPositionX = event.clientX;
      this.mouseOverWindowVariables.oldPositionY = event.clientY;
      this.mouseOverWindowVariables.windowWidth = this.$el.getBoundingClientRect().width;
      this.mouseOverWindowVariables.windowHeight = this.$el.getBoundingClientRect().height;
      this.mouseOverWindowVariables.mousePositionX = this.mouseOverWindowVariables.oldPositionX - this.$el.getBoundingClientRect().x;
      this.mouseOverWindowVariables.mousePositionY = this.mouseOverWindowVariables.oldPositionY - this.$el.getBoundingClientRect().y;
      this.mouseOverWindowVariables.mouseOnResizeSpace = false;

      if (this.mouseOverWindowVariables.mousePositionX + this.WINDOW_MOVE_AREA_SPACE >= this.mouseOverWindowVariables.windowWidth) {
        this.$el.style.cursor = 'e-resize';
        this.mouseOverWindowVariables.mouseOnResizeSpace = true;
      } else if (this.mouseOverWindowVariables.mousePositionX - this.WINDOW_MOVE_AREA_SPACE <= 0) {
        this.$el.style.cursor = 'w-resize';
        this.mouseOverWindowVariables.mouseOnResizeSpace = true;
      } else if (this.mouseOverWindowVariables.mousePositionY + this.WINDOW_MOVE_AREA_SPACE >= this.mouseOverWindowVariables.windowHeight) {
        this.$el.style.cursor = 'n-resize';
        this.mouseOverWindowVariables.mouseOnResizeSpace = true;
      } else if (this.mouseOverWindowVariables.mousePositionY - this.WINDOW_MOVE_AREA_SPACE <= 0) {
        this.$el.style.cursor = 's-resize';
        this.mouseOverWindowVariables.mouseOnResizeSpace = true;
      }

      if (!this.mouseOverWindowVariables.mouseOnResizeSpace) {
        this.$el.style.cursor = 'auto';
        this.mouseOverWindowVariables.mouseOnResizeSpace = false;
      }
    },
    moveWindowOnMouseDownWindowCorners(event) {
      this.mouseDownWindowVariables.oldPositionX = event.clientX;
      this.mouseDownWindowVariables.oldPositionY = event.clientY;
      this.mouseDownWindowVariables.windowWidth = this.$el.getBoundingClientRect().width;
      this.mouseDownWindowVariables.windowHeight = this.$el.getBoundingClientRect().height;
      this.mouseDownWindowVariables.windowLeft = this.$el.getBoundingClientRect().left;
      this.mouseDownWindowVariables.windowTop = this.$el.getBoundingClientRect().top;
      this.mouseDownWindowVariables.mousePositionX = this.mouseDownWindowVariables.oldPositionX - this.$el.getBoundingClientRect().x;
      this.mouseDownWindowVariables.mousePositionY = this.mouseDownWindowVariables.oldPositionY - this.$el.getBoundingClientRect().y;

      const windowBorderSidePressed = this.returnPressedWindowBorderSide();

      const onMouseMove = (event) => {
        event.preventDefault();

        switch (windowBorderSidePressed) {
          case 'right': {
            this.$el.style.width =
                `${(this.mouseDownWindowVariables.windowWidth - (this.mouseDownWindowVariables.oldPositionX - event.clientX))}px`;
            break;
          }
          case 'left': {
            const widthChange = this.mouseDownWindowVariables.windowLeft - event.clientX;
            const newWidth = this.mouseDownWindowVariables.windowWidth + widthChange;
            this.$el.style.width = `${newWidth}px`
            this.$el.style.left = `${event.clientX}px`
            break;
          }
          case 'bottom': {
            this.$el.style.height =
                `${(this.mouseDownWindowVariables.windowHeight - (this.mouseDownWindowVariables.oldPositionY - event.clientY))}px`;
            break;
          }
          case 'top': {
            const heightChange = this.mouseDownWindowVariables.windowTop - event.clientY;
            const newHeight = this.mouseDownWindowVariables.windowHeight + heightChange;
            this.$el.style.height = `${newHeight}px`
            this.$el.style.top = `${event.clientY}px`
            break;
          }
        }
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    returnPressedWindowBorderSide() {
      if (this.mouseOverWindowVariables.mousePositionX + this.WINDOW_MOVE_AREA_SPACE >= this.mouseOverWindowVariables.windowWidth)
        return 'right';
      else if (this.mouseOverWindowVariables.mousePositionX - this.WINDOW_MOVE_AREA_SPACE <= 0)
        return 'left';
      else if (this.mouseOverWindowVariables.mousePositionY + this.WINDOW_MOVE_AREA_SPACE >= this.mouseOverWindowVariables.windowHeight)
        return 'bottom';
      else if (this.mouseOverWindowVariables.mousePositionY - this.WINDOW_MOVE_AREA_SPACE <= 0)
        return 'top';
    },
    onMouseDownHeader(event) {
      if (this.mouseOverWindowVariables.mouseOnResizeSpace === true){
        return;
      }
      this.moveWindowVariables.NUM_WIDTH = this.convertFromPixelStringToNumber(window.getComputedStyle(this.$el).width);
      this.moveWindowVariables.NUM_HEIGHT = this.convertFromPixelStringToNumber(window.getComputedStyle(this.$el).height);

      this.moveWindowVariables.prevX = event.clientX;
      this.moveWindowVariables.prevY = event.clientY;

      document.addEventListener('mouseup', this.onMouseUpHeader);
      document.addEventListener('mousemove', this.onMouseMoveHeader);
    },
    onMouseMoveHeader(event) {
      if ((this.moveWindowVariables.NUM_WIDTH === this.MAXIMUM_WIDTH ||
              this.moveWindowVariables.NUM_WIDTH + 1 === this.MAXIMUM_WIDTH ||
              this.moveWindowVariables.NUM_WIDTH - 1 === this.MAXIMUM_WIDTH) &&
          (this.moveWindowVariables.NUM_HEIGHT === this.MAXIMUM_HEIGHT ||
              (this.moveWindowVariables.NUM_HEIGHT - 45) === this.MAXIMUM_HEIGHT)) {
        this.$el.style.left = `${this.moveWindowVariables.prevX - (this.moveWindowVariables.NUM_WIDTH / 2 - 250)}px`;
        this.$el.style.top = `${this.moveWindowVariables.prevY}px`;
        this.$el.style.width = '60%';
        this.$el.style.height = '80%';
      }

      const newX = event.clientX;
      const newY = event.clientY;

      this.moveWindowVariables.yOutOfBoundsPositive = newX >= this.MAXIMUM_WIDTH - 1;
      this.moveWindowVariables.yOutOfBoundsNegative = newX <= 1;

      const deltaX = newX - this.moveWindowVariables.prevX;
      const deltaY = newY - this.moveWindowVariables.prevY;

      this.$el.style.left = `${this.$el.offsetLeft + deltaX}px`;
      this.$el.style.top = `${this.$el.offsetTop + deltaY}px`;

      this.moveWindowVariables.prevX = newX;
      this.moveWindowVariables.prevY = newY;
    },
    onMouseUpHeader() {
      if (this.moveWindowVariables.yOutOfBoundsPositive) {
        this.$el.style.left = '50%';
        this.$el.style.width = '50%';
        this.$el.style.height = '100%';
        this.$el.style.top = 0;
      }
      if (this.moveWindowVariables.yOutOfBoundsNegative) {
        this.$el.style.left = 0;
        this.$el.style.width = '50%';
        this.$el.style.height = '100%';
        this.$el.style.top = 0;
      }

      document.removeEventListener('mousemove', this.onMouseMoveHeader);
      document.removeEventListener('mouseup', this.onMouseUpHeader);
    },
    minimizeWindow() {
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