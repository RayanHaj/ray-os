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
import {useApplicationStatesStore, useGlobalStore, useWindowStore} from "@/stores/globalState";
import SplitWindowsComponent from "@/ui/split-windows-component";
import WindowHeader from "@/components/window/elements/windowHeader.vue";
import {mapStores} from "pinia";

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
      mousePositionVariables: {
        positionX: 0,
        positionY: 0,
        oldPositionX: 0,
        oldPositionY: 0
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
      windowOutOfBounds: null,
      mouseleaveTimeoutId: null,
      mouseOnResizeSpace: false,
      showSplitWindowComponent: false,
      mouseOnSplitWindowComponent: false,
    }
  },
  beforeMount() {
    this.$emit('rendered');
    this.windowObject = this.windowStore.openWindows.find(window => window.id === this.windowId);
    this.customStylingValuesWindow.WIDTH = `${this.globalStore.browserWindowSize.WIDTH}px`;
    this.customStylingValuesWindow.HEIGHT = `${this.globalStore.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED}px`;
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
    'windowStore.openTabsName': {
      handler(newValue) {
        if (this.windowObject.name === newValue) {
          this.windowStore.pushToOpenTabs(newValue);
        }
      }
    },
    'windowStore.playCloseAnimation': {
      handler(newValue) {
        if (newValue.id === this.windowObject.id && newValue.value === true) {
          this.playCloseAnimation().then(() => {
            this.windowStore.playCloseAnimation = {
              id: null,
              value: false
            };
            this.windowStore.closeOpenWindowByWindowId(newValue.id);
          });
        }
      }
    }
  },
  computed: {
    ...mapStores(useWindowStore, useGlobalStore, useApplicationStatesStore),
    getZIndex() {
      const window = this.windowStore.openWindows.find(window => Number(window.id) === Number(this.windowId));
      return window.zIndex;
    }
  },
  methods: {
    maximizeWindow() {
      const windowWidth = this.customStylingValuesWindow.WIDTH;
      const windowHeight = this.customStylingValuesWindow.HEIGHT;
      const browserWindowWidth = this.globalStore.browserWindowSize.WIDTH;
      const browserWindowHeight = this.globalStore.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED

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
      const browserWindowWidth = this.globalStore.browserWindowSize.WIDTH;
      const browserWindowHeight = this.globalStore.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED;

      return (
          (windowWidth === browserWindowWidth && windowHeight === browserWindowHeight) ||
          (windowWidth === browserWindowWidth / 2 && windowHeight === browserWindowHeight) ||
          (windowWidth === browserWindowWidth && windowHeight === browserWindowHeight / 2) ||
          (windowWidth === browserWindowWidth / 2 && windowHeight === browserWindowHeight / 2)
      );
    },
    mouseOverEventListeners(event) {
      event.preventDefault();

      if (this.windowEvents.moving || this.windowEvents.resizing) {
        return;
      }

      this.mousePositionVariables.oldPositionX = event.clientX;
      this.mousePositionVariables.oldPositionY = event.clientY;
      this.mousePositionVariables.positionX = this.mousePositionVariables.oldPositionX - this.$el.getBoundingClientRect().x;
      this.mousePositionVariables.positionY = this.mousePositionVariables.oldPositionY - this.$el.getBoundingClientRect().y;
      this.mouseOnResizeSpace = false;

      const windowBorderSidePressed = this.returnPressedWindowBorderSide();

      let cursorString = '';
      windowBorderSidePressed.forEach(side => cursorString += side[0]);

      if (windowBorderSidePressed.length > 0) {
        this.customStylingValuesWindow.CURSOR = `${cursorString}-resize`;
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
      const dimensions = {
        width: this.$el.getBoundingClientRect().width,
        height: this.$el.getBoundingClientRect().height,
        left: this.$el.getBoundingClientRect().left,
        top: this.$el.getBoundingClientRect().top
      }

      this.mousePositionVariables.oldPositionX = event.clientX;
      this.mousePositionVariables.oldPositionY = event.clientY;
      this.mousePositionVariables.positionX = this.mousePositionVariables.oldPositionX - this.$el.getBoundingClientRect().x;
      this.mousePositionVariables.positionY = this.mousePositionVariables.oldPositionY - this.$el.getBoundingClientRect().y;

      const windowBorderSidePressed = this.returnPressedWindowBorderSide();

      const onMove = (event) => {
        event.preventDefault();
        this.windowEvents.resizing = true;
        this.$emit('windowResizing', true);

        this.resizeWindowFromCorner(windowBorderSidePressed, event, dimensions);
      }

      const onUp = () => {
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
    resizeWindowFromCorner(side, event, dimensions) {
      const minWidthPercentage = parseFloat(this.customStylingValuesWindow.MINIMUM_WIDTH);
      const minWidthPixels = (minWidthPercentage / 100) * this.globalStore.browserWindowSize.WIDTH;
      const minHeightPercentage = parseFloat(this.customStylingValuesWindow.MINIMUM_HEIGHT);
      const minHeightPixels = (minHeightPercentage / 100) * this.globalStore.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED;

      side.forEach(side => {
        switch (side) {
          case 'east': {
            this.customStylingValuesWindow.WIDTH = `${(dimensions.width - (this.mousePositionVariables.oldPositionX - event.clientX))}px`;
          }
            break;
          case 'west': {
            const widthChange = dimensions.left - event.clientX;
            const newWidth = dimensions.width + widthChange;

            if (newWidth <= minWidthPixels) {
              return;
            }

            this.customStylingValuesWindow.WIDTH = `${newWidth}px`
            this.customStylingValuesWindow.LEFT = `${event.clientX}px`
          }
            break;
          case 'south': {
            this.customStylingValuesWindow.HEIGHT = `${(dimensions.height - (this.mousePositionVariables.oldPositionY - event.clientY))}px`;
          }
            break;
          case 'north': {
            const heightChange = dimensions.top - event.clientY;
            const newHeight = dimensions.height + heightChange;

            if (newHeight <= minHeightPixels) {
              return;
            }

            this.customStylingValuesWindow.HEIGHT = `${newHeight}px`
            this.customStylingValuesWindow.TOP = `${event.clientY}px`
          }
        }
      });
    },
    returnPressedWindowBorderSide() {
      const north = this.mousePositionVariables.positionY - this.WINDOW_RESIZE_AREA_SPACE.top <= 0;
      const east = this.mousePositionVariables.positionX + this.WINDOW_RESIZE_AREA_SPACE.right >= this.$el.getBoundingClientRect().width;
      const south = this.mousePositionVariables.positionY + this.WINDOW_RESIZE_AREA_SPACE.bottom >= this.$el.getBoundingClientRect().height;
      const west = this.mousePositionVariables.positionX - this.WINDOW_RESIZE_AREA_SPACE.left <= 0;

      if (north && east) return ['north', 'east'];
      if (north && west) return ['north', 'west'];
      if (south && east) return ['south', 'east'];
      if (south && west) return ['south', 'west'];

      if (north) return ['north'];
      if (east) return ['east'];
      if (south) return ['south'];
      if (west) return ['west'];

      return [];
    },
    onMouseDownHeader(event) {
      if (this.mouseOnResizeSpace === true) {
        return;
      }

      this.mousePositionVariables.oldPositionX = event.clientX;
      this.mousePositionVariables.oldPositionY = event.clientY;

      document.addEventListener('mouseup', this.onMouseUpHeader);
      document.addEventListener('mousemove', this.onMouseMoveHeader);
      document.addEventListener('touchmove', this.onMouseMoveHeader);
      document.addEventListener('touchend', this.onMouseUpHeader)
    },
    onMouseMoveHeader(event) {
      this.windowEvents.moving = true;

      let windowWidth = this.$el.getBoundingClientRect().width;
      let windowHeight = this.$el.getBoundingClientRect().height;

      if (windowWidth === this.globalStore.browserWindowSize.WIDTH && windowHeight === this.globalStore.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED) {
        this.customStylingValuesWindow.LEFT = `${event.clientX / 2}px`;
        this.customStylingValuesWindow.TOP = `${event.clientY / 2}px`;
        this.customStylingValuesWindow.WIDTH = '60%';
        this.customStylingValuesWindow.HEIGHT = '80%';
        return;
      }

      const newX = event.clientX;
      const newY = event.clientY;

      this.updateWindowOutOfBounds(newX, newY);

      const deltaX = newX - this.mousePositionVariables.oldPositionX;
      const deltaY = newY - this.mousePositionVariables.oldPositionY;

      this.customStylingValuesWindow.LEFT = `${this.$el.offsetLeft + deltaX}px`;
      this.customStylingValuesWindow.TOP = `${this.$el.offsetTop + deltaY}px`;

      this.mousePositionVariables.oldPositionX = newX;
      this.mousePositionVariables.oldPositionY = newY;
    },
    updateWindowOutOfBounds(x, y) {
      if (y >= this.globalStore.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED - 1)
        this.windowOutOfBounds = 'bottom';
      else if (x >= this.globalStore.browserWindowSize.WIDTH - 1)
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
      if (this.windowStore.openWindows.length > 1) {
        const window = this.windowStore.openWindows.find(element => element.id === this.windowId);
        if (window === undefined) {
          return;
        }

        const splitWindow = this.windowStore.openWindows.find(element => element.zIndex === (window.zIndex + 1) || element.zIndex === (window.zIndex - 1));
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
      const height = this.globalStore.browserWindowSize.HEIGHT;
      const heightTaskbarExcluded = this.globalStore.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED;
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
      this.windowStore.pushToTopOpenWindows(this.windowId);
    },
    splitCurrentWindow(position) {
      if (position === null) {
        return;
      }
      const height = this.globalStore.browserWindowSize.HEIGHT;
      const heightTaskbarExcluded = this.globalStore.browserWindowSize.HEIGHT_TASKBAR_EXCLUDED;
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
        this.applicationStatesStore.playVideoObject = null;
      }

      this.windowStore.playCloseAnimation = {
        id: this.windowObject.id,
        value: true
      }
    },
    onClickWindow(event) {
      this.windowStore.pushToTopOpenWindows(event.currentTarget.id);
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