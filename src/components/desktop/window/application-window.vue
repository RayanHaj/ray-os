<template>
  <div class="window"
       @mousemove="mouseOverEventListeners"
       @mousedown="moveWindowOnMouseDownWindowCorners"
       @touchover="mouseOverEventListeners"
       @touchstart="moveWindowOnMouseDownWindowCorners"
  >
    <div class="window-header">
      <div class="top-header" @mousedown.prevent="onMouseDownHeader($event)" @touchstart.prevent="onMouseDownHeader($event)">
        <div class="window-name"> {{ windowName }}</div>
        <div class="window-state-control">
          <SvgComponent :svg-type="'minimize'" @clicked="minimizeWindow"></SvgComponent>
          <SvgComponent :svg-type="'maximize'" @clicked="maximizeWindow"></SvgComponent>
          <SvgComponent :svg-type="'close'" @clicked="$emit('closeTab', windowName)"></SvgComponent>
        </div>
      </div>
    </div>
    <div class="window-content">
      <FileExplorer v-if="windowName === 'File Explorer'"/>
      <SettingsWindow v-if="windowName === 'Settings'" @theme-changed="$emit('themeChanged')"/>
      <WelcomeWindow v-if="windowName === 'Welcome'"/>
      <MicrosoftEdgeWindow v-if="windowName === 'Microsoft Edge'" :disable-pointer-events="disablePointerEvents"/>
      <SereneSoundsWindow v-if="windowName === 'Serene Sounds'"/>
    </div>
  </div>
</template>

<script>
import FileExplorerWindow from "@/components/desktop/window/windowContent/fileExplorer/file-explorer-window";
import SettingsWindow from "@/components/desktop/window/windowContent/settings/settings-window";
import WelcomeWindow from "@/components/desktop/window/windowContent/welcome/welcome-window";
import MicrosoftEdgeWindow from "@/components/desktop/window/windowContent/microsoftEdge/microsoft-edge-window";
import SereneSoundsWindow from "@/components/desktop/window/windowContent/sereneSounds/serene-sounds-window";
import SvgComponent from "@/components/ui/svg-component";
import { enableDragDropTouch } from "@/assets/libraries/drag-drop-touch.esm.min";

export default {
  name: "application-window",
  components: {
    SvgComponent,
    SereneSoundsWindow,
    MicrosoftEdgeWindow,
    WelcomeWindow,
    SettingsWindow: SettingsWindow,
    FileExplorer: FileExplorerWindow
  },
  data() {
    return {
      components: [MicrosoftEdgeWindow, WelcomeWindow, SettingsWindow, FileExplorerWindow, SvgComponent],
      MAXIMUM_WIDTH: '',
      MAXIMUM_HEIGHT: '',
      WINDOW_RESIZE_AREA_SPACE: 10,
      dynamicStyles: null,
      disablePointerEvents: false,
      moveWindowVariables: {
        xOutOfBoundsPositive: false,
        xOutOfBoundsNegative: false,
        yOutOfBoundsPositive: false,
        yOutOfBoundsNegative: false,
        NUM_WIDTH: 0,
        NUM_HEIGHT: 0,
        prevX: 0,
        prevY: 0,
        windowIsMoving: false,
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
        mousePressedDown: false,
      }
    }
  },
  beforeMount() {
    this.$emit('rendered');
  },
  mounted() {
    enableDragDropTouch();
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
    },
    openWindows: {
      type: Array,
      required: true
    },
    splitOtherWindow: {
      type: Object,
      required: true
    },
    taskbarHeight: {
      type: Number,
      required: true
    }
  },
  emits: ['splitOtherWindow', 'minimizeWindow', 'rendered', 'closeTab'],
  watch: {
    windowSize(newSize) {
      this.MAXIMUM_WIDTH = newSize[0];
      console.log('windowSizeWatcher: ' + newSize)
      this.MAXIMUM_HEIGHT = newSize[1];
    },
    splitOtherWindow(newWindow) {
      if (newWindow.window.windowName === this.windowName) {
        switch (newWindow.xOutOfBoundsPositive) {
          case 'positive-x':
            this.moveWindowVariables.xOutOfBoundsPositive = false;
            this.moveWindowVariables.xOutOfBoundsNegative = true;
            this.moveWindowVariables.yOutOfBoundsPositive = false;
            this.moveWindowVariables.yOutOfBoundsNegative = false;
            break;
          case 'negative-x':
            this.moveWindowVariables.xOutOfBoundsPositive = true;
            this.moveWindowVariables.xOutOfBoundsNegative = false;
            this.moveWindowVariables.yOutOfBoundsPositive = false;
            this.moveWindowVariables.yOutOfBoundsNegative = false;
            break;
          case 'positive-y':
            this.moveWindowVariables.yOutOfBoundsPositive = false;
            this.moveWindowVariables.yOutOfBoundsNegative = true;
            this.moveWindowVariables.xOutOfBoundsPositive = false;
            this.moveWindowVariables.xOutOfBoundsNegative = false;
            break;
          case 'negative-y':
            this.moveWindowVariables.yOutOfBoundsPositive = true;
            this.moveWindowVariables.yOutOfBoundsNegative = false;
            this.moveWindowVariables.xOutOfBoundsPositive = false;
            this.moveWindowVariables.xOutOfBoundsNegative = false;
            break;
        }

        this.splitWindow();
      }
    }
  },
  methods: {
    maximizeWindow() {
      let windowWidth = this.$el.offsetWidth;
      let windowHeight = this.$el.offsetHeight;

      let result = false;
      for (let i = 0; i <= 2; i++) {
        if ((windowWidth === this.MAXIMUM_WIDTH || windowWidth + i === this.MAXIMUM_WIDTH || windowWidth - i === this.MAXIMUM_WIDTH) && windowHeight >= this.MAXIMUM_HEIGHT) {
          this.$el.style.width = '60%';
          this.$el.style.height = '80%';
          return
        }
      }

      if (result) {
        return;
      }

      if (windowWidth !== this.MAXIMUM_WIDTH || windowHeight !== this.MAXIMUM_HEIGHT) {
        this.$el.style.width = '100%';
        this.$el.style.height = `calc(100% - ${this.taskbarHeight}px)`;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const newX = (viewportWidth - this.$el.offsetWidth) / 2;
        const newY = (viewportHeight - this.$el.offsetHeight) / 2 - 22;

        this.$el.style.left = `${newX}px`;
        this.$el.style.top = `${newY}px`;
      }
    },
    mouseOverEventListeners(event) {
      event.preventDefault();

      if (this.moveWindowVariables.windowIsMoving === true) {
        return;
      }

      this.mouseOverWindowVariables.oldPositionX = event.clientX;
      this.mouseOverWindowVariables.oldPositionY = event.clientY;
      this.mouseOverWindowVariables.windowWidth = this.$el.getBoundingClientRect().width;
      this.mouseOverWindowVariables.windowHeight = this.$el.getBoundingClientRect().height;
      this.mouseOverWindowVariables.mousePositionX = this.mouseOverWindowVariables.oldPositionX - this.$el.getBoundingClientRect().x;
      this.mouseOverWindowVariables.mousePositionY = this.mouseOverWindowVariables.oldPositionY - this.$el.getBoundingClientRect().y;
      this.mouseOverWindowVariables.mouseOnResizeSpace = false;

      if (this.mouseOverWindowVariables.mousePositionX + this.WINDOW_RESIZE_AREA_SPACE >= this.mouseOverWindowVariables.windowWidth) {
        this.$el.style.cursor = 'e-resize';
        this.mouseOverWindowVariables.mouseOnResizeSpace = true;
      } else if (this.mouseOverWindowVariables.mousePositionX - this.WINDOW_RESIZE_AREA_SPACE <= 0) {
        this.$el.style.cursor = 'w-resize';
        this.mouseOverWindowVariables.mouseOnResizeSpace = true;
      } else if (this.mouseOverWindowVariables.mousePositionY + this.WINDOW_RESIZE_AREA_SPACE >= this.mouseOverWindowVariables.windowHeight) {
        this.$el.style.cursor = 'n-resize';
        this.mouseOverWindowVariables.mouseOnResizeSpace = true;
      } else if (this.mouseOverWindowVariables.mousePositionY - this.WINDOW_RESIZE_AREA_SPACE <= 0) {
        this.$el.style.cursor = 's-resize';
        this.mouseOverWindowVariables.mouseOnResizeSpace = true;
      }

      if (this.mouseOverWindowVariables.mouseOnResizeSpace === false && this.mouseDownWindowVariables.mousePressedDown === false) {
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

      const onMove = (event) => {
        event.preventDefault();

        this.mouseDownWindowVariables.mousePressedDown = true;

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

        this.disablePointerEvents = true;
      }

      const onUp = () => {
        this.disablePointerEvents = false;
        this.mouseDownWindowVariables.mousePressedDown = false;

        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove);
      document.addEventListener('touchend', onUp);
    },
    returnPressedWindowBorderSide() {
      if (this.mouseOverWindowVariables.mousePositionX + this.WINDOW_RESIZE_AREA_SPACE >= this.mouseOverWindowVariables.windowWidth)
        return 'right';
      else if (this.mouseOverWindowVariables.mousePositionX - this.WINDOW_RESIZE_AREA_SPACE <= 0)
        return 'left';
      else if (this.mouseOverWindowVariables.mousePositionY + this.WINDOW_RESIZE_AREA_SPACE >= this.mouseOverWindowVariables.windowHeight)
        return 'bottom';
      else if (this.mouseOverWindowVariables.mousePositionY - this.WINDOW_RESIZE_AREA_SPACE <= 0)
        return 'top';
    },
    onMouseDownHeader(event) {
      if (this.mouseOverWindowVariables.mouseOnResizeSpace === true) {
        return;
      }

      this.moveWindowVariables.NUM_WIDTH = this.$el.offsetWidth;
      this.moveWindowVariables.NUM_HEIGHT = this.$el.offsetHeight;

      this.moveWindowVariables.prevX = event.clientX;
      this.moveWindowVariables.prevY = event.clientY;

      document.addEventListener('mouseup', this.onMouseUpHeader);
      document.addEventListener('mousemove', this.onMouseMoveHeader);
      document.addEventListener('touchmove', this.onMouseMoveHeader);
      document.addEventListener('touchend', this.onMouseUpHeader)
    },
    onMouseMoveHeader(event) {
      this.moveWindowVariables.windowIsMoving = true;

      let windowWidth = this.moveWindowVariables.NUM_WIDTH;
      let windowHeight = this.moveWindowVariables.NUM_HEIGHT;

      for (let i = 0; i <= 2; i++) {
        if ((windowWidth === this.MAXIMUM_WIDTH || windowWidth + i === this.MAXIMUM_WIDTH || windowWidth - i === this.MAXIMUM_WIDTH) && windowHeight >= this.MAXIMUM_HEIGHT) {
          this.$el.style.left = `${this.moveWindowVariables.prevX - (this.moveWindowVariables.NUM_WIDTH / 2 - 250)}px`;
          this.$el.style.top = `${this.moveWindowVariables.prevY}px`;
          this.$el.style.width = '60%';
          this.$el.style.height = '80%';
          break;
        }
      }

      const newX = event.clientX;
      const newY = event.clientY;

      this.moveWindowVariables.xOutOfBoundsPositive = newX >= this.MAXIMUM_WIDTH - 1;
      this.moveWindowVariables.xOutOfBoundsNegative = newX <= 1;

      this.moveWindowVariables.yOutOfBoundsNegative = newY >= this.MAXIMUM_HEIGHT - 1;
      this.moveWindowVariables.yOutOfBoundsPositive = newY <= 1;

      const deltaX = newX - this.moveWindowVariables.prevX;
      const deltaY = newY - this.moveWindowVariables.prevY;

      this.$el.style.left = `${this.$el.offsetLeft + deltaX}px`;
      this.$el.style.top = `${this.$el.offsetTop + deltaY}px`;

      this.moveWindowVariables.prevX = newX;
      this.moveWindowVariables.prevY = newY;
    },
    onMouseUpHeader() {
      this.moveWindowVariables.windowIsMoving = false;
      const returnPosOutOfBoundsPositiveOrNegative = this.splitWindow();
      if (this.openWindows.length > 1) {
        const currentWindowIndex = this.openWindows.findIndex(window => window.windowName === this.windowName);

        let nextWindow = '';
        if (this.openWindows.length - 1 >= currentWindowIndex + 1) {
          nextWindow = this.openWindows[currentWindowIndex + 1];
        } else if (this.openWindows.length - 1 >= currentWindowIndex - 1) {
          nextWindow = this.openWindows[currentWindowIndex - 1];
        }

        this.$emit(
            'splitOtherWindow',
            {'window': nextWindow, 'xOutOfBoundsPositive': returnPosOutOfBoundsPositiveOrNegative}
        )
      }

      document.removeEventListener('mousemove', this.onMouseMoveHeader);
      document.removeEventListener('mouseup', this.onMouseUpHeader);
      document.removeEventListener('touchmove', this.onMouseMoveHeader);
      document.removeEventListener('touchend', this.onMouseUpHeader);
    },
    splitWindow() {
      if (this.moveWindowVariables.xOutOfBoundsPositive) {
        this.$el.style.left = '50%';
        this.$el.style.width = '50%';
        this.$el.style.height = `${this.MAXIMUM_HEIGHT}px`;
        this.$el.style.top = 0;
        return 'positive-x';
      } else if (this.moveWindowVariables.xOutOfBoundsNegative) {
        this.$el.style.left = 0;
        this.$el.style.width = '50%';
        this.$el.style.height = `${this.MAXIMUM_HEIGHT}px`;
        this.$el.style.top = 0;
        return 'negative-x';
      } else if (this.moveWindowVariables.yOutOfBoundsPositive) {
        this.$el.style.left = 0;
        this.$el.style.width = '100%';
        this.$el.style.height = `${this.MAXIMUM_HEIGHT / 2}px`;
        this.$el.style.top = 0;
        return 'positive-y';
      } else if (this.moveWindowVariables.yOutOfBoundsNegative) {
        this.$el.style.left = 0;
        this.$el.style.width = '100%';
        this.$el.style.height = `${this.MAXIMUM_HEIGHT / 2}px`;
        this.$el.style.top = `${this.MAXIMUM_HEIGHT / 2}px`;
        return 'negative-y';
      }

      return false;
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
  color: var(--font-color);
}

.window {
  box-sizing: border-box;
  min-width: 40%;
  min-height: 30%;
  display: flex;
  flex-direction: column;
  resize: both;
  overflow: auto;
  position: relative;
  background-color: var(--background-color-window);
  border: black 1px solid;
}

.window-content {
  overflow: auto;
  height: 100%;
}

.window-header {
  height: 30px;
  position: sticky;
  top: 0;
  background-color: var(--taskbar-color);
}

.top-header {
  display: flex;
  flex-direction: row;
  gap: 20px;
  justify-content: space-between;
  align-items: center;
  height: 30px;
  margin-top: 3px;
}

.window-name {
  font-size: 14px;
  font-weight: bold;
  margin-left: 10px;
}

.window-state-control {
  display: flex;
  flex-direction: row;
  gap: 10px;
  padding: 10px;
}

path {
  pointer-events: none;
}
</style>