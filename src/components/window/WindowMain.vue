<template>
  <section class="window"
           :style="{
       top: customStylingValuesWindow.TOP,
       left: customStylingValuesWindow.LEFT,
       cursor: customStylingValuesWindow.CURSOR,
       userSelect: customStylingValuesWindow.USER_SELECT,
       width: customStylingValuesWindow.WIDTH,
       height: customStylingValuesWindow.HEIGHT,
       minWidth: customStylingValuesWindow.MINIMUM_WIDTH,
       minHeight: customStylingValuesWindow.MINIMUM_HEIGHT,
       transition: !windowEvents.resizing ? 'width 0.2s, height 0.2s, left 0.2s, top 0.2s, border-radius 0.1s, opacity 0.3s' : undefined,
       borderRadius: !windowEvents.maximized ? customStylingValuesWindow.BORDER_RADIUS : undefined,
       boxShadow: !windowEvents.maximized ? '0 0 12px 2px rgba(255, 188, 188, 0.8)' : undefined,
       zIndex: getZIndex,
       }"
           @mousemove="mouseOverEventListeners"
           @mousedown="moveWindowOnMouseDownWindowCorners"
           @click="onClickWindow"
  >
    <WindowHeader
        :name="windowObject.name"
        @click-header="$emit('clicked', $event)"
        @mousedown-header="onMouseDownHeader($event)"
        @mouseenter-maximize="onMouseenterMaximizeSvg"
        @mouseleave-maximize="onMouseleaveMaximizeSvg"
        @minimize="minimizeWindow"
        @maximize="maximizeWindow"
        @close="closeWindow"
    />
    <SplitWindowsComponent
        v-show="showSplitWindowComponent"
        @mouseover="mouseOnSplitWindowComponent = true"
        @mouseleave="onMouseleaveSplitWindowComponent"
        @position="splitCurrentWindow"
    />
    <div @click="$emit('clicked', $event)" class="window-content">
      <ContentMain :window-id="windowObject.id"
                   :disable-pointer-events="disablePointerEvents"
                   :application-window-size="{
                     WIDTH: customStylingValuesWindow.WIDTH,
                     HEIGHT: customStylingValuesWindow.HEIGHT
                   }"
                   @move-calculator-window-to-top-corner="UpdateWindowSizeAndPosition(0, '40%', '30%', 0)"
      />
    </div>
  </section>
</template>

<script>
import ContentMain from "@/components/window/content/ContentMain";
import {useGlobalState} from "@/stores/globalState";
import SplitWindowsComponent from "@/ui/split-windows-component";
import WindowHeader from "@/components/window/elements/windowHeader.vue";

export default {
  name: "application-window",
  components: {
    WindowHeader,
    ContentMain,
    SplitWindowsComponent
  },
  data() {
    return {
      customStylingValuesWindow: {
        MINIMUM_WIDTH: '40%',
        MINIMUM_HEIGHT: '45%',
        BORDER_RADIUS: '10px',
        USER_SELECT: 'auto',
        CURSOR: 'auto',
        WIDTH: '',
        HEIGHT: '',
        LEFT: '',
        TOP: ''
      },
      windowObject: {
        id: null,
        name: null,
        zIndex: null,
        minimized: null,
        fileProperties: {
          name: null,
          type: null,
          createdAt: null,
          image: null,
          file: null,
          id: null
        },
      },
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
      windowEvents: {
        moving: false,
        resizing: false,
        maximized: false,
      },
      timeoutIds: {
        mouseenter: null,
        mouseleave: null
      },
      resizeObserver: null,
      mouseleaveTimeoutId: null,
      windowOutOfBounds: null,
      mouseOnResizeSpace: false,
      disablePointerEvents: false,
      showSplitWindowComponent: false,
      mouseOnSplitWindowComponent: false,
    }
  },
  beforeMount() {
    this.$emit('rendered');
    this.windowObject = this.globalState.openWindows.find(window => window.id === this.windowId);
    this.customStylingValuesWindow.WIDTH = `${this.globalState.browserWindowSize.WIDTH}px`;
    this.customStylingValuesWindow.HEIGHT = `${this.globalState.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED}px`;
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(() => {
      this.windowEvents.maximized = this.getWindowIsMaximizedOrSplit();
    });
    this.resizeObserver.observe(this.$el);
  },
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  props: {
    windowSize: {
      type: Array,
      required: false
    },
    splitOtherWindow: {
      type: Object,
      required: true
    },
    windowId: {
      type: Number,
      required: true
    }
  },
  emits: ['splitOtherWindow', 'minimizeWindow', 'rendered', 'clicked', 'windowResizing'],
  watch: {
    splitOtherWindow(newWindow) {
      if (newWindow.window.id === this.windowObject.id) {
        this.windowOutOfBounds = newWindow.windowOutOfBounds;
        this.splitWindow();
      }
    },
    'globalState.openTabsName': {
      handler(newValue) {
        if (this.windowObject.name === newValue) {
          this.globalState.pushToOpenTabs(newValue);
        }
      }
    },
    'globalState.playCloseAnimation': {
      handler(newValue) {
        if (newValue.id === this.windowObject.id && newValue.value === true) {
          this.playCloseAnimation().then(() => {
            this.globalState.playCloseAnimation = {
              id: null,
              value: false
            };
            this.globalState.closeOpenWindowByWindowId(newValue.id);
          });
        }
      }
    }
  },
  computed: {
    globalState() {
      return useGlobalState();
    },
    getZIndex() {
      const window = this.globalState.openWindows.find(window => Number(window.id) === Number(this.windowId));
      return window.zIndex;
    }
  },
  methods: {
    maximizeWindow() {
      const windowWidth = this.customStylingValuesWindow.WIDTH;
      const windowHeight = this.customStylingValuesWindow.HEIGHT;
      const browserWindowWidth = this.globalState.browserWindowSize.WIDTH;
      const browserWindowHeight = this.globalState.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED

      this.showSplitWindowComponent = false;

      if (windowWidth === browserWindowWidth && windowHeight === browserWindowHeight) {
        this.customStylingValuesWindow.WIDTH = '60%';
        this.customStylingValuesWindow.HEIGHT = '80%';
        return;
      }

      this.customStylingValuesWindow.WIDTH = `100%`;
      this.customStylingValuesWindow.HEIGHT = `${browserWindowHeight}px`;
      this.customStylingValuesWindow.LEFT = `0`;
      this.customStylingValuesWindow.TOP = `0`;
    },
    getWindowIsMaximizedOrSplit() {
      if (!this.$el) {
        return;
      }
      const windowWidth = this.$el.getBoundingClientRect().width;
      const windowHeight = this.$el.getBoundingClientRect().height;
      const browserWindowWidth = this.globalState.browserWindowSize.WIDTH;
      const browserWindowHeight = this.globalState.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED;

      return (
          (windowWidth === browserWindowWidth && windowHeight === browserWindowHeight) ||
          (windowWidth === browserWindowWidth / 2 && windowHeight === browserWindowHeight) ||
          (windowWidth === browserWindowWidth && windowHeight === browserWindowHeight / 2) ||
          (windowWidth === browserWindowWidth / 2 && windowHeight === browserWindowHeight / 2)
      );
    },
    mouseOverEventListeners(event) {
      event.preventDefault();

      if (this.windowEvents.moving === true) {
        return;
      }

      this.mouseOverWindowVariables.oldPositionX = event.clientX;
      this.mouseOverWindowVariables.oldPositionY = event.clientY;
      this.mouseOverWindowVariables.mousePositionX = this.mouseOverWindowVariables.oldPositionX - this.$el.getBoundingClientRect().x;
      this.mouseOverWindowVariables.mousePositionY = this.mouseOverWindowVariables.oldPositionY - this.$el.getBoundingClientRect().y;
      this.mouseOnResizeSpace = false;

      const windowBorderSidePressed = this.returnPressedWindowBorderSide();

      if (windowBorderSidePressed) {
        this.customStylingValuesWindow.CURSOR = `${windowBorderSidePressed}-resize`;
        this.customStylingValuesWindow.USER_SELECT = 'none';
        this.mouseOnResizeSpace = true;
      }

      if (this.mouseOnResizeSpace === false && this.windowEvents.resizing === false) {
        this.customStylingValuesWindow.CURSOR = 'auto';
        this.customStylingValuesWindow.USER_SELECT = 'auto';
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
        this.windowEvents.resizing = true;
        const minWidthPercentage = parseFloat(this.customStylingValuesWindow.MINIMUM_WIDTH);
        const minWidthPixels = (minWidthPercentage / 100) * this.globalState.browserWindowSize.WIDTH;

        const minHeightPercentage = parseFloat(this.customStylingValuesWindow.MINIMUM_HEIGHT);
        const minHeightPixels = (minHeightPercentage / 100) * this.globalState.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED;

        const east = () => {
          this.customStylingValuesWindow.WIDTH = `${(windowWidth - (this.mouseDownWindowVariables.oldPositionX - event.clientX))}px`;
        }

        const west = () => {
          const widthChange = windowLeft - event.clientX;
          const newWidth = windowWidth + widthChange;

          if (newWidth <= minWidthPixels) {
            return;
          }

          this.customStylingValuesWindow.WIDTH = `${newWidth}px`
          this.customStylingValuesWindow.LEFT = `${event.clientX}px`
        }

        const south = () => {
          this.customStylingValuesWindow.HEIGHT = `${(windowHeight - (this.mouseDownWindowVariables.oldPositionY - event.clientY))}px`;
        }

        const north = () => {
          const heightChange = windowTop - event.clientY;
          const newHeight = windowHeight + heightChange;

          if (newHeight <= minHeightPixels) {
            return;
          }

          this.customStylingValuesWindow.HEIGHT = `${newHeight}px`
          this.customStylingValuesWindow.TOP = `${event.clientY}px`
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
        this.windowEvents.resizing = false;
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
      this.windowEvents.moving = true;

      let windowWidth = this.$el.getBoundingClientRect().width;
      let windowHeight = this.$el.getBoundingClientRect().height;

      if (windowWidth === this.globalState.browserWindowSize.WIDTH && windowHeight === this.globalState.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED) {
        this.customStylingValuesWindow.LEFT = `${event.clientX / 2}px`;
        this.customStylingValuesWindow.TOP = `${event.clientY / 2}px`;
        this.customStylingValuesWindow.WIDTH = '60%';
        this.customStylingValuesWindow.HEIGHT = '80%';
        return;
      }

      const newX = event.clientX;
      const newY = event.clientY;

      this.updateWindowOutOfBounds(newX, newY);

      const deltaX = newX - this.mouseDownWindowVariables.oldPositionX;
      const deltaY = newY - this.mouseDownWindowVariables.oldPositionY;

      this.customStylingValuesWindow.LEFT = `${this.$el.offsetLeft + deltaX}px`;
      this.customStylingValuesWindow.TOP = `${this.$el.offsetTop + deltaY}px`;

      this.mouseDownWindowVariables.oldPositionX = newX;
      this.mouseDownWindowVariables.oldPositionY = newY;
    },
    updateWindowOutOfBounds(x, y) {
      if (y >= this.globalState.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED - 1)
        this.windowOutOfBounds = 'bottom';
      else if (x >= this.globalState.browserWindowSize.WIDTH - 1)
        this.windowOutOfBounds = 'right';
      else if (y <= 1)
        this.windowOutOfBounds = 'top';
      else if (x <= 1)
        this.windowOutOfBounds = 'left';
      else
        this.windowOutOfBounds = null;

      return this.windowOutOfBounds;
    },
    onMouseUpHeader() {
      this.windowEvents.moving = false;
      const windowOutOfBounds = this.splitWindow();
      if (this.globalState.openWindows.length > 1) {
        const window = this.globalState.openWindows.find(element => element.id === this.windowId);
        if (window === undefined) {
          return;
        }

        const splitWindow = this.globalState.openWindows.find(element => element.zIndex === (window.zIndex + 1) || element.zIndex === (window.zIndex - 1));
        if (splitWindow === undefined) {
          return;
        }

        this.$emit('splitOtherWindow', {
          'window': splitWindow,
          'windowOutOfBounds': windowOutOfBounds
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

      let oppositeValue = null;
      switch (this.windowOutOfBounds) {
        case 'right': {
          this.UpdateWindowSizeAndPosition('50%', '50%', `${heightInPercentage}%`, 0);
          oppositeValue = 'left';
        }
          break;
        case 'left': {
          this.UpdateWindowSizeAndPosition(0, '50%', `${heightInPercentage}%`, 0);
          oppositeValue = 'right';
        }
          break;
        case 'top': {
          this.UpdateWindowSizeAndPosition(0, '100%', `${halfHeightInPercentage}%`, 0);
          oppositeValue = 'bottom';
        }
          break;
        case 'bottom': {
          this.UpdateWindowSizeAndPosition(0, '100%', `${halfHeightInPercentage}%`, `${halfHeightInPercentage}%`);
          oppositeValue = 'top';
        }
      }

      return oppositeValue;
    },
    UpdateWindowSizeAndPosition(left, width, height, top) {
      this.customStylingValuesWindow.LEFT = left;
      this.customStylingValuesWindow.WIDTH = width;
      this.customStylingValuesWindow.HEIGHT = height;
      this.customStylingValuesWindow.TOP = top;
      this.globalState.pushToTopOpenWindows(this.windowId);
    },
    splitCurrentWindow(position) {
      if (position === null) {
        return;
      }
      const height = this.globalState.browserWindowSize.HEIGHT;
      const heightTaskbarExcluded = this.globalState.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED;
      const heightInPercentage = (heightTaskbarExcluded / height) * 100;
      const halfHeightInPercentage = ((heightTaskbarExcluded / 2) / height) * 100;

      switch (position) {
        case 'topLeft': {
          this.UpdateWindowSizeAndPosition(0, '50%', `${halfHeightInPercentage}%`, 0);
          break;
        }
        case 'topRight': {
          this.UpdateWindowSizeAndPosition('50%', '50%', `${halfHeightInPercentage}%`, 0);
          break;
        }
        case 'bottomLeft': {
          this.UpdateWindowSizeAndPosition(0, '50%', `${halfHeightInPercentage}%`, `${halfHeightInPercentage}%`);
          break;
        }
        case 'bottomRight': {
          this.UpdateWindowSizeAndPosition('50%', '50%', `${halfHeightInPercentage}%`, `${halfHeightInPercentage}%`);
          break;
        }
        case 'left': {
          this.UpdateWindowSizeAndPosition(0, '50%', `${heightInPercentage}%`, 0);
          break;
        }
        case 'right': {
          this.UpdateWindowSizeAndPosition('50%', '50%', `${heightInPercentage}%`, 0)
          break;
        }
        case 'top': {
          this.UpdateWindowSizeAndPosition(0, '100%', `${halfHeightInPercentage}%`, 0);
          break;
        }
        case 'bottom': {
          this.UpdateWindowSizeAndPosition(0, '100%', `${halfHeightInPercentage}%`, `${halfHeightInPercentage}%`);
          break;
        }
      }
    },
    onMouseenterMaximizeSvg() {
      if (this.timeoutIds.mouseleave) {
        clearTimeout(this.timeoutIds.mouseleave);
        this.timeoutIds.mouseleave = null;
      }
      if (this.timeoutIds.mouseenter === null) {
        this.timeoutIds.mouseenter = setTimeout(() => {
          this.showSplitWindowComponent = true;
        }, 500);
      }
    },
    onMouseleaveMaximizeSvg() {
      clearTimeout(this.timeoutIds.mouseenter);
      this.timeoutIds.mouseenter = null;

      this.timeoutIds.mouseleave = setTimeout(() => {
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
    minimizeWindow() {
      this.$emit('minimizeWindow', Number(this.windowId));
    },
    closeWindow() {
      if (this.windowObject.name === 'Video Player') {
        this.globalState.playVideoObject = null;
      }

      this.globalState.playCloseAnimation = {
        id: this.windowObject.id,
        value: true
      }
    },
    onClickWindow(event) {
      this.globalState.pushToTopOpenWindows(event.currentTarget.id);
    },
    async playCloseAnimation() {
      return new Promise((resolve) => {
        this.$el.style.opacity = '0';

        setTimeout(() => {
          resolve();
        }, 150);
      })
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
  box-sizing: border-box;
  color: var(--font-color);
}

.window {
  display: flex;
  flex-direction: column;
  overflow: auto;
  position: absolute;
  background-color: var(--background-color-window);
  border: var(--border-window-color) 2px solid;
  scrollbar-color: var(--font-color) var(--background-color-input);
  opacity: 100%;
}

.window-content {
  overflow: auto;
  height: 100%;
}

path {
  pointer-events: none;
}
</style>