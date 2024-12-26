<template>
  <div class="window"
       ref="window"
       :style="{ minWidth: MINIMUM_WIDTH_WINDOW, minHeight: MINIMUM_HEIGHT_WINDOW }"
       @mousemove="mouseOverEventListeners"
       @mousedown="moveWindowOnMouseDownWindowCorners"
       @touchover="mouseOverEventListeners"
       @touchstart="moveWindowOnMouseDownWindowCorners"
  >
    <div class="window-header">
      <div class="top-header" @click="$emit('clicked', $event)" @mousedown.prevent="onMouseDownHeader($event)"
           @touchstart.prevent="onMouseDownHeader($event)">
        <ImgComponent :image-name="windowName" :custom-width="20" :custom-height="20" class="window-img"></ImgComponent>
        <div class="window-name"> {{ windowName }}</div>
      </div>
      <div class="window-state-control">
        <div class="svg-wrapper">
          <button class="minimize-button" @click="minimizeWindow">
            <SvgComponent :svg-type="'minimize'"/>
          </button>
          <button class="maximize-button" @click="maximizeWindow" @mouseenter="onMouseoverMaximizeSvg" @mouseleave="onMouseleaveMaximizeSvg">
            <SvgComponent :svg-type="'maximize'"/>
          </button>
          <button class="close-button" @click="$emit('closeWindow', windowName)">
            <SvgComponent :svg-type="'close'"/>
          </button>
        </div>
        <SplitWindowsComponent
            v-show="showSplitWindowComponent"
            @mouseover="mouseOnSplitWindowComponent = true"
            @mouseleave="onMouseleaveSplitWindowComponent"
            @position="splitCurrentWindow"
        />
      </div>
    </div>
    <div @click="$emit('clicked', $event)" class="window-content">
      <WindowContent :window-name="windowName"
                     :disable-pointer-events="disablePointerEvents"
                     @theme-changed="$emit('themeChanged')"
                     @move-calculator-window-to-top-corner="setSplitWindowValues(0, '40%', '30%', 0)"
      />
    </div>
  </div>
</template>

<script>
import SvgComponent from "@/components/ui/svg-component";
import WindowContent from "@/components/desktop/window/windowContent/window-content";
import {enableDragDropTouch} from "@/assets/libraries/drag-drop-touch.esm.min";
import html2canvas from "html2canvas";
import ImgComponent from "@/components/ui/img-component";
import SplitWindowsComponent from "@/components/ui/split-windows-component";

export default {
  name: "application-window",
  components: {
    ImgComponent,
    SvgComponent,
    WindowContent,
    SplitWindowsComponent
  },
  data() {
    return {
      MAXIMUM_WIDTH: '',
      MAXIMUM_HEIGHT: '',
      MINIMUM_WIDTH_WINDOW: '40%',
      MINIMUM_HEIGHT_WINDOW: '45%',
      WINDOW_RESIZE_AREA_SPACE: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      },
      disablePointerEvents: false,
      showSplitWindowComponent: false,
      mouseOnSplitWindowComponent: false,
      mouseoverTimeoutId: null,
      mouseleaveTimeoutId: null,
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
    },
    currentHoveredImageTaskbarName: {
      type: String,
      required: false
    }
  },
  emits: ['splitOtherWindow', 'minimizeWindow', 'rendered', 'closeWindow', 'clicked', 'previewApplicationWindow', 'windowResizing'],
  watch: {
    windowSize(newSize) {
      this.MAXIMUM_WIDTH = newSize[0];
      this.MAXIMUM_HEIGHT = newSize[1];
    },
    splitOtherWindow(newWindow) {
      if (newWindow.window.windowName === this.windowName) {
        this.setOutOfBoundsValues(
            newWindow.xOutOfBoundsPositive === 'negative-x',
            newWindow.xOutOfBoundsPositive === 'positive-x',
            newWindow.xOutOfBoundsPositive === 'negative-y',
            newWindow.xOutOfBoundsPositive === 'positive-y'
        );
        this.splitWindow();
      }
    },
    currentHoveredImageTaskbarName(newValue) {
      if (this.windowName === newValue) {
        html2canvas(this.$el).then((canvas) => {
          canvas.style.transform = "scale(1)";
          canvas.style.transformOrigin = "center center";
          this.$emit('previewApplicationWindow', canvas);
        })
      }
    }
  },
  methods: {
    maximizeWindow() {
      let windowWidth = this.$el.offsetWidth;
      let windowHeight = this.$el.offsetHeight;

      if (windowWidth === this.MAXIMUM_WIDTH && windowHeight === this.MAXIMUM_HEIGHT) {
        this.$el.style.width = '60%';
        this.$el.style.height = '80%';
        return;
      }

      this.$el.style.width = '100%';
      this.$el.style.height = `calc(100% - ${this.taskbarHeight}px)`;
      this.$el.style.left = `${(window.innerWidth - this.$el.offsetWidth) / 2}px`;
      this.$el.style.top = `${((window.innerHeight - this.$el.offsetHeight) / 2) - (this.taskbarHeight / 2)}px`;
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

      const windowBorderSidePressed = this.returnPressedWindowBorderSide();

      if (windowBorderSidePressed) {
        this.$el.style.cursor = `${windowBorderSidePressed}-resize`;
        this.$el.style.userSelect = 'none';
        this.mouseOverWindowVariables.mouseOnResizeSpace = true;
      }

      if (this.mouseOverWindowVariables.mouseOnResizeSpace === false && this.mouseDownWindowVariables.mousePressedDown === false) {
        this.$el.style.cursor = 'auto';
        this.$el.style.userSelect = 'auto';
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
        this.$emit('windowResizing', true);
        this.mouseDownWindowVariables.mousePressedDown = true;

        const minWidthPercentage = parseFloat(this.MINIMUM_WIDTH_WINDOW);
        const minWidthPixels = (minWidthPercentage / 100) * this.MAXIMUM_WIDTH;

        const minHeightPercentage = parseFloat(this.MINIMUM_HEIGHT_WINDOW);
        const minHeightPixels = (minHeightPercentage / 100) * this.MAXIMUM_HEIGHT;

        const east = () => {
          this.$el.style.width = `${(this.mouseDownWindowVariables.windowWidth - (this.mouseDownWindowVariables.oldPositionX - event.clientX))}px`;
        }

        const west = () => {
          const widthChange = this.mouseDownWindowVariables.windowLeft - event.clientX;
          const newWidth = this.mouseDownWindowVariables.windowWidth + widthChange;

          if (newWidth <= minWidthPixels) {
            return;
          }

          this.$el.style.width = `${newWidth}px`
          this.$el.style.left = `${event.clientX}px`
        }

        const south = () => {
          this.$el.style.height =
              `${(this.mouseDownWindowVariables.windowHeight - (this.mouseDownWindowVariables.oldPositionY - event.clientY))}px`;
        }

        const north = () => {
          const heightChange = this.mouseDownWindowVariables.windowTop - event.clientY;
          const newHeight = this.mouseDownWindowVariables.windowHeight + heightChange;

          if (newHeight <= minHeightPixels) {
            return;
          }

          this.$el.style.height = `${newHeight}px`
          this.$el.style.top = `${event.clientY}px`
        }

        switch (windowBorderSidePressed) {
          case 'n': {
            north();
            break;
          }
          case 'e': {
            east();
            break;
          }
          case 's': {
            south();
            break;
          }
          case 'w': {
            west();
            break;
          }
          case 'ne': {
            north();
            east();
            break;
          }
          case 'nw': {
            north();
            west();
            break;
          }
          case 'se': {
            south();
            east();
            break;
          }
          case 'sw': {
            south();
            west();
            break;
          }
        }

        this.disablePointerEvents = true;
      }

      const onUp = () => {
        this.disablePointerEvents = false;
        this.mouseDownWindowVariables.mousePressedDown = false;
        this.$emit('windowResizing', false);

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
      const north = this.mouseOverWindowVariables.mousePositionY - this.WINDOW_RESIZE_AREA_SPACE.top <= 0;
      const east = this.mouseOverWindowVariables.mousePositionX + this.WINDOW_RESIZE_AREA_SPACE.right >= this.mouseOverWindowVariables.windowWidth;
      const south = this.mouseOverWindowVariables.mousePositionY + this.WINDOW_RESIZE_AREA_SPACE.bottom >= this.mouseOverWindowVariables.windowHeight;
      const west = this.mouseOverWindowVariables.mousePositionX - this.WINDOW_RESIZE_AREA_SPACE.left <= 0;

      if (north && east) return 'ne';
      if (north && west) return 'nw';
      if (south && east) return 'se';
      if (south && west) return 'sw';

      if (north) return 'n';
      if (east) return 'e';
      if (south) return 's';
      if (west) return 'w';
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
        if (windowWidth === this.MAXIMUM_WIDTH && windowHeight === this.MAXIMUM_HEIGHT) {
          this.$el.style.left = `${this.moveWindowVariables.prevX - (this.moveWindowVariables.NUM_WIDTH / 3)}px`;
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

        this.$emit('splitOtherWindow', {
          'window': nextWindow,
          'xOutOfBoundsPositive': returnPosOutOfBoundsPositiveOrNegative
        });
      }

      document.removeEventListener('mousemove', this.onMouseMoveHeader);
      document.removeEventListener('mouseup', this.onMouseUpHeader);
      document.removeEventListener('touchmove', this.onMouseMoveHeader);
      document.removeEventListener('touchend', this.onMouseUpHeader);
    },
    splitWindow() {
      if (this.moveWindowVariables.xOutOfBoundsPositive) {
        this.setSplitWindowValues('50%', '50%', `${this.MAXIMUM_HEIGHT}px`, 0);
        return 'positive-x';
      } else if (this.moveWindowVariables.xOutOfBoundsNegative) {
        this.setSplitWindowValues(0, '50%', `${this.MAXIMUM_HEIGHT}px`, 0);
        return 'negative-x';
      } else if (this.moveWindowVariables.yOutOfBoundsPositive) {
        this.setSplitWindowValues(0, '100%', `${this.MAXIMUM_HEIGHT / 2}px`, 0);
        return 'positive-y';
      } else if (this.moveWindowVariables.yOutOfBoundsNegative) {
        this.setSplitWindowValues(0, '100%', `${this.MAXIMUM_HEIGHT / 2}px`, `${this.MAXIMUM_HEIGHT / 2}px`);
        return 'negative-y';
      }

      return false;
    },
    setSplitWindowValues(left, width, height, top) {
      this.$el.style.left = left;
      this.$el.style.width = width;
      this.$el.style.height = height;
      this.$el.style.top = top;
    },
    splitCurrentWindow(position) {
      switch (position) {
        case 'topLeft': {
          this.setSplitWindowValues(0, '50%', `${this.MAXIMUM_HEIGHT / 2}px`, 0);
          break;
        }
        case 'topRight': {
          this.setSplitWindowValues('50%', '50%', `${this.MAXIMUM_HEIGHT / 2}px`, 0);
          break;
        }
        case 'bottomLeft': {
          this.setSplitWindowValues(0, '50%', `${this.MAXIMUM_HEIGHT / 2}px`, `${this.MAXIMUM_HEIGHT / 2}px`);
          break;
        }
        case 'bottomRight': {
          this.setSplitWindowValues('50%', '50%', `${this.MAXIMUM_HEIGHT / 2}px`, `${this.MAXIMUM_HEIGHT / 2}px`);
          break;
        }
        case 'left': {
          this.setSplitWindowValues(0, '50%', `${this.MAXIMUM_HEIGHT}px`, 0);
          break;
        }
        case 'right': {
          this.setSplitWindowValues('50%', '50%', `${this.MAXIMUM_HEIGHT}px`, 0)
          break;
        }
        case 'top': {
          this.setSplitWindowValues(0, '100%', `${this.MAXIMUM_HEIGHT / 2}px`, 0);
          break;
        }
        case 'bottom': {
          this.setSplitWindowValues(0, '100%', `${this.MAXIMUM_HEIGHT / 2}px`, `${this.MAXIMUM_HEIGHT / 2}px`);
          break;
        }
      }
    },
    onMouseoverMaximizeSvg() {
      if (this.mouseleaveTimeoutId) {
        clearTimeout(this.mouseleaveTimeoutId);
        this.mouseleaveTimeoutId = null;
      }
      if (this.mouseoverTimeoutId === null) {
        this.mouseoverTimeoutId = setTimeout(() => {
          this.showSplitWindowComponent = true;
        }, 500);
      }
    },
    onMouseleaveMaximizeSvg() {
      clearTimeout(this.mouseoverTimeoutId);
      this.mouseoverTimeoutId = null;

      this.mouseleaveTimeoutId = setTimeout(() => {
        if (this.mouseOnSplitWindowComponent === false) {
          this.showSplitWindowComponent = false;
        }
      }, 500);
    },
    onMouseleaveSplitWindowComponent() {
      if (this.showSplitWindowComponent === true) {
        this.showSplitWindowComponent = false;
      }

      this.mouseOnSplitWindowComponent = false;
    },
    setOutOfBoundsValues(xPositive, xNegative, yPositive, yNegative) {
      this.moveWindowVariables.xOutOfBoundsPositive = xPositive;
      this.moveWindowVariables.xOutOfBoundsNegative = xNegative;
      this.moveWindowVariables.yOutOfBoundsPositive = yPositive;
      this.moveWindowVariables.yOutOfBoundsNegative = yNegative;
    },
    minimizeWindow() {
      this.$emit('minimizeWindow', this.windowName);
    }
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
  display: flex;
  flex-direction: column;
  overflow: auto;
  position: relative;
  background-color: var(--background-color-window);
  border: var(--font-color) 8px solid;
}

.window-content {
  overflow: auto;
  height: 100%;
}

.window-header {
  display: flex;
  flex-direction: row;
  height: 30px;
  position: sticky;
  top: 0;
  background-color: var(--taskbar-color);
}

.top-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 30px;
  width: 100%;
  padding-left: 10px;
}

.window-name {
  font-size: 14px;
  font-weight: bold;
  margin-left: 10px;
}

.window-state-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  height: 100%;
}

.svg-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: end;
  height: 100%;
  width: auto;
}

.svg-wrapper button {
  background-color: transparent;
  border: none;
  padding: 8px;
  width: 60px;
}

.close-button:hover {
  background-color: red;
}

.maximize-button:hover, .minimize-button:hover {
  background-color: black;
}

path {
  pointer-events: none;
}
</style>