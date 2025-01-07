<template>
  <div class="window"
       ref="window"
       :style="{
       minWidth: MINIMUM_WIDTH_WINDOW,
       minHeight: MINIMUM_HEIGHT_WINDOW,
       transition: windowIsMoving || windowIsResizing ? undefined : 'width 0.5s, height 0.5s, left 0.5s, top 0.5s',
       zIndex: globalState.openWindows.findIndex(window => Number(window.id) === windowId) + 2
       }"
       @mousemove="mouseOverEventListeners"
       @mousedown="moveWindowOnMouseDownWindowCorners"
       @touchover="mouseOverEventListeners"
       @touchstart="moveWindowOnMouseDownWindowCorners"
       @click="onClickWindow"
  >
    <div class="window-header">
      <div class="top-header" @click="$emit('clicked', $event)" @mousedown.prevent="onMouseDownHeader($event)"
           @touchstart.prevent="onMouseDownHeader($event)">
        <ImgComponent :image-name="windowObject.name" :custom-width="20" :custom-height="20"
                      class="window-img"></ImgComponent>
        <div class="window-name"> {{ windowObject.name }}</div>
      </div>
      <div class="window-state-control">
        <div class="svg-wrapper">
          <button class="minimize-button" @click="minimizeWindow">
            <SvgComponent :svg-type="'minimize'"/>
          </button>
          <button class="maximize-button" @click="maximizeWindow" @mouseenter="onMouseoverMaximizeSvg"
                  @mouseleave="onMouseleaveMaximizeSvg">
            <SvgComponent :svg-type="'maximize'"/>
          </button>
          <button class="close-button" @click="closeWindow">
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
      <WindowContent :window-id="windowObject.id"
                     :disable-pointer-events="disablePointerEvents"
                     :application-window-size="applicationWindowSize"
                     @move-calculator-window-to-top-corner="setSplitWindowValues(0, '40%', '30%', 0)"
      />
    </div>
  </div>
</template>

<script>
import SvgComponent from "@/components/ui/svg-component";
import WindowContent from "@/components/desktop/window/windowContent/window-content";
import {enableDragDropTouch} from "@/assets/libraries/drag-drop-touch.esm.min";
import {useGlobalState} from "@/stores/globalState";
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
      MINIMUM_WIDTH_WINDOW: '40%',
      MINIMUM_HEIGHT_WINDOW: '45%',
      windowObject: null,
      mouseoverTimeoutId: null,
      mouseleaveTimeoutId: null,
      applicationWindowSize: null,
      lastWindowSplitPosition: null,
      windowIsMoving: false,
      windowIsResizing: false,
      mouseOnResizeSpace: false,
      disablePointerEvents: false,
      showSplitWindowComponent: false,
      mouseOnSplitWindowComponent: false,
      WINDOW_RESIZE_AREA_SPACE: {
        top: 10,
        left: 10,
        right: 10,
        bottom: 10
      },
      mouseOverWindowVariables: {
        oldPositionX: 0,
        oldPositionY: 0,
        mousePositionX: 0,
        mousePositionY: 0
      },
      mouseDownWindowVariables: {
        oldPositionX: 0,
        oldPositionY: 0,
        mousePositionX: 0,
        mousePositionY: 0
      },
      windowOutOfBounds: {
        xPositive: false,
        xNegative: false,
        yPositive: false,
        yNegative: false
      },
    }
  },
  beforeMount() {
    this.$emit('rendered');
    this.windowObject = this.globalState.openWindows.find(window => window.id === this.windowId);
  },
  mounted() {
    enableDragDropTouch();
    this.applicationWindowSize = {
      width: this.globalState.browserWindowSize.WIDTH,
      height: this.globalState.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED
    }

    this.$el.style.width = `${this.applicationWindowSize.width}px`;
    this.$el.style.height = `${this.applicationWindowSize.height}px`;
  },
  props: {
    windowSize: {
      type: Array,
      required: false
    },
    windowId: {
      type: Number,
      required: true
    },
    splitOtherWindow: {
      type: Object,
      required: true
    },
    currentHoveredImageTaskbarName: {
      type: String,
      required: false
    }
  },
  emits: ['splitOtherWindow', 'minimizeWindow', 'rendered', 'clicked', 'previewApplicationWindow', 'windowResizing'],
  watch: {
    splitOtherWindow(newWindow) {
      if (newWindow.window.id === this.windowObject.id) {
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
      if (this.windowObject.name === newValue) {
        html2canvas(this.$el).then((canvas) => {
          canvas.style.transform = "scale(1)";
          canvas.style.transformOrigin = "center center";
          this.$emit('previewApplicationWindow', canvas);
        })
      }
    },
    'globalState.browserWindowSize': {
      handler() {
        this.splitWindow();
        this.splitCurrentWindow(this.lastWindowSplitPosition ?? null)
      },
      deep: true
    }
  },
  computed: {
    globalState() {
      return useGlobalState();
    }
  },
  methods: {
    maximizeWindow() {
      const windowWidth = this.$el.getBoundingClientRect().width;
      const windowHeight = this.$el.getBoundingClientRect().height;
      const browserWindowWidth = this.globalState.browserWindowSize.WIDTH;
      const browserWindowHeight = this.globalState.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED

      this.showSplitWindowComponent = false;

      if (windowWidth === browserWindowWidth && windowHeight === browserWindowHeight) {
        this.$el.style.width = '60%';
        this.$el.style.height = '80%';
        return;
      }

      this.$el.style.width = `100%`;
      this.$el.style.height = `${browserWindowHeight}px`;
      this.$el.style.left = `0`;
      this.$el.style.top = `0`;
    },
    mouseOverEventListeners(event) {
      event.preventDefault();

      if (this.windowIsMoving === true) {
        return;
      }

      this.mouseOverWindowVariables.oldPositionX = event.clientX;
      this.mouseOverWindowVariables.oldPositionY = event.clientY;
      this.mouseOverWindowVariables.mousePositionX = this.mouseOverWindowVariables.oldPositionX - this.$el.getBoundingClientRect().x;
      this.mouseOverWindowVariables.mousePositionY = this.mouseOverWindowVariables.oldPositionY - this.$el.getBoundingClientRect().y;
      this.mouseOnResizeSpace = false;

      const windowBorderSidePressed = this.returnPressedWindowBorderSide();

      if (windowBorderSidePressed) {
        this.$el.style.cursor = `${windowBorderSidePressed}-resize`;
        this.$el.style.userSelect = 'none';
        this.mouseOnResizeSpace = true;
      }

      if (this.mouseOnResizeSpace === false && this.windowIsResizing === false) {
        this.$el.style.cursor = 'auto';
        this.$el.style.userSelect = 'auto';
        this.mouseOnResizeSpace = false;
      }
    },
    moveWindowOnMouseDownWindowCorners(event) {
      const windowWidth = this.$el.getBoundingClientRect().width;
      const windowHeight = this.$el.getBoundingClientRect().height;
      const windowLeft = this.$el.getBoundingClientRect().left;
      const windowTop = this.$el.getBoundingClientRect().top;
      this.mouseDownWindowVariables.oldPositionX = event.clientX;
      this.mouseDownWindowVariables.oldPositionY = event.clientY;
      this.mouseDownWindowVariables.mousePositionX = this.mouseDownWindowVariables.oldPositionX - this.$el.getBoundingClientRect().x;
      this.mouseDownWindowVariables.mousePositionY = this.mouseDownWindowVariables.oldPositionY - this.$el.getBoundingClientRect().y;

      const windowBorderSidePressed = this.returnPressedWindowBorderSide();

      const onMove = (event) => {
        event.preventDefault();
        this.$emit('windowResizing', true);
        this.windowIsResizing = true;

        const minWidthPercentage = parseFloat(this.MINIMUM_WIDTH_WINDOW);
        const minWidthPixels = (minWidthPercentage / 100) * this.globalState.browserWindowSize.WIDTH;

        const minHeightPercentage = parseFloat(this.MINIMUM_HEIGHT_WINDOW);
        const minHeightPixels = (minHeightPercentage / 100) * this.globalState.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED;

        const east = () => {
          this.$el.style.width = `${(windowWidth - (this.mouseDownWindowVariables.oldPositionX - event.clientX))}px`;
        }

        const west = () => {
          const widthChange = windowLeft - event.clientX;
          const newWidth = windowWidth + widthChange;

          if (newWidth <= minWidthPixels) {
            return;
          }

          this.$el.style.width = `${newWidth}px`
          this.$el.style.left = `${event.clientX}px`
        }

        const south = () => {
          this.$el.style.height = `${(windowHeight - (this.mouseDownWindowVariables.oldPositionY - event.clientY))}px`;
        }

        const north = () => {
          const heightChange = windowTop - event.clientY;
          const newHeight = windowHeight + heightChange;

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
        this.windowIsResizing = false;
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
      const east = this.mouseOverWindowVariables.mousePositionX + this.WINDOW_RESIZE_AREA_SPACE.right >= this.$el.getBoundingClientRect().width;
      const south = this.mouseOverWindowVariables.mousePositionY + this.WINDOW_RESIZE_AREA_SPACE.bottom >= this.$el.getBoundingClientRect().height;
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
      if (this.mouseOnResizeSpace === true) {
        return;
      }

      this.mouseDownWindowVariables.oldPositionX = event.clientX;
      this.mouseDownWindowVariables.oldPositionY = event.clientY;

      document.addEventListener('mouseup', this.onMouseUpHeader);
      document.addEventListener('mousemove', this.onMouseMoveHeader);
      document.addEventListener('touchmove', this.onMouseMoveHeader);
      document.addEventListener('touchend', this.onMouseUpHeader)
    },
    onMouseMoveHeader(event) {
      this.windowIsMoving = true;

      let windowWidth = this.$el.getBoundingClientRect().width;
      let windowHeight = this.$el.getBoundingClientRect().height;

      if (windowWidth === this.globalState.browserWindowSize.WIDTH && windowHeight === this.globalState.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED) {
        this.$el.style.left = `${event.clientX / 2}px`;
        this.$el.style.top = `${event.clientY / 2}px`;
        this.$el.style.width = '60%';
        this.$el.style.height = '80%';
        return;
      }

      const newX = event.clientX;
      const newY = event.clientY;

      this.windowOutOfBounds.xPositive = newX >= this.globalState.browserWindowSize.WIDTH - 1;
      this.windowOutOfBounds.xNegative = newX <= 1;

      this.windowOutOfBounds.yNegative = newY >= this.globalState.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED - 1;
      this.windowOutOfBounds.yPositive = newY <= 1;

      const deltaX = newX - this.mouseDownWindowVariables.oldPositionX;
      const deltaY = newY - this.mouseDownWindowVariables.oldPositionY;

      this.$el.style.left = `${this.$el.offsetLeft + deltaX}px`;
      this.$el.style.top = `${this.$el.offsetTop + deltaY}px`;

      this.mouseDownWindowVariables.oldPositionX = newX;
      this.mouseDownWindowVariables.oldPositionY = newY;
    },
    onMouseUpHeader() {
      this.windowIsMoving = false;
      const returnPosOutOfBoundsPositiveOrNegative = this.splitWindow();
      if (this.globalState.openWindows.length > 1) {
        const currentWindowIndex = this.globalState.openWindows.findIndex(window => window.id === this.windowObject.id);

        let nextWindow = '';
        if (this.globalState.openWindows.length - 1 >= currentWindowIndex + 1) {
          nextWindow = this.globalState.openWindows[currentWindowIndex + 1];
        } else if (this.globalState.openWindows.length - 1 >= currentWindowIndex - 1) {
          nextWindow = this.globalState.openWindows[currentWindowIndex - 1];
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
      const height = this.globalState.browserWindowSize.HEIGHT;
      const heightTaskbarExcluded = this.globalState.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED;
      const heightInPercentage = (heightTaskbarExcluded / height) * 100;
      const halfHeightInPercentage = ((heightTaskbarExcluded / 2) / height) * 100;
      if (this.windowOutOfBounds.xPositive) {
        this.setSplitWindowValues('50%', '50%', `${heightInPercentage}%`, 0);
        return 'positive-x';
      } else if (this.windowOutOfBounds.xNegative) {
        this.setSplitWindowValues(0, '50%', `${heightInPercentage}%`, 0);
        return 'negative-x';
      } else if (this.windowOutOfBounds.yPositive) {
        this.setSplitWindowValues(0, '100%', `${halfHeightInPercentage}%`, 0);
        return 'positive-y';
      } else if (this.windowOutOfBounds.yNegative) {
        this.setSplitWindowValues(0, '100%', `${halfHeightInPercentage}%`, `${halfHeightInPercentage}%`);
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
      if (position === null) {
        return;
      }
      const height = this.globalState.browserWindowSize.HEIGHT;
      const heightTaskbarExcluded = this.globalState.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED;
      const heightInPercentage = (heightTaskbarExcluded / height) * 100;
      const halfHeightInPercentage = ((heightTaskbarExcluded / 2) / height) * 100;
      this.lastWindowSplitPosition = position;
      switch (position) {
        case 'topLeft': {
          this.setSplitWindowValues(0, '50%', `${halfHeightInPercentage}%`, 0);
          break;
        }
        case 'topRight': {
          this.setSplitWindowValues('50%', '50%', `${halfHeightInPercentage}%`, 0);
          break;
        }
        case 'bottomLeft': {
          this.setSplitWindowValues(0, '50%', `${halfHeightInPercentage}%`, `${halfHeightInPercentage}%`);
          break;
        }
        case 'bottomRight': {
          this.setSplitWindowValues('50%', '50%', `${halfHeightInPercentage}%`, `${halfHeightInPercentage}%`);
          break;
        }
        case 'left': {
          this.setSplitWindowValues(0, '50%', `${heightInPercentage}%`, 0);
          break;
        }
        case 'right': {
          this.setSplitWindowValues('50%', '50%', `${heightInPercentage}%`, 0)
          break;
        }
        case 'top': {
          this.setSplitWindowValues(0, '100%', `${halfHeightInPercentage}%`, 0);
          break;
        }
        case 'bottom': {
          this.setSplitWindowValues(0, '100%', `${halfHeightInPercentage}%`, `${halfHeightInPercentage}%`);
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
      this.windowOutOfBounds.xPositive = xPositive;
      this.windowOutOfBounds.xNegative = xNegative;
      this.windowOutOfBounds.yPositive = yPositive;
      this.windowOutOfBounds.yNegative = yNegative;
    },
    minimizeWindow() {
      this.$emit('minimizeWindow', this.windowObject.id);
    },
    closeWindow() {
      this.globalState.closeOpenWindowByWindowId(this.windowObject.id);
    },
    onClickWindow(event) {
      this.globalState.pushToTopOpenWindows(event.currentTarget.id);
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
  position: absolute;
  background-color: var(--background-color-window);
  border: var(--border-window-color) 8px solid;
  scrollbar-color: var(--font-color) var(--background-color-input);
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
  z-index: 2;
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