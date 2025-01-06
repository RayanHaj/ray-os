<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else class="grid-container" ref="gridContainer" @click="onClickContainer">
    <div class="grid" ref="grid" v-if="GRID_HEIGHT > 0"
         @dragover.prevent="dragAndDropEventListenersDesktop($event, 'dragover')"
         @touchover.prevent="dragAndDropEventListenersDesktop($event, 'touchover')">
      <div v-for="(numX, indexX) in GRID_WIDTH" :key="numX" class="tile-column" ref="tileColumn">
        <div v-for="(numY, indexY) in GRID_HEIGHT" :key="numY" class="tile" ref="tile"
             :id="indexX * GRID_HEIGHT + indexY"
             :class="{'filled': isTileFillable(indexX, indexY) }"
             @drop="dragAndDropEventListenersDesktop($event, 'drop')"
             @dragstart="dragAndDropEventListenersDesktop($event, 'dragstart')"
             @touchstart="dragAndDropEventListenersDesktop($event, 'touchstart')"
             @mouseover="onMouseOverTile" @touchover="onMouseOverTile"
             @dblclick="openApplication(globalState.desktopFiles[indexX * GRID_HEIGHT + indexY]?.name)"
             @contextmenu.prevent="onRightClickTile"
             tabindex="0"
             :style="{
              border: `${ this.showTileBorders ? '1px solid white' : 'none' }`
            }"
        >
          <div
              v-if="isTileFillable(indexX, indexY)"
              @mouseenter="globalState.desktopFiles[indexX * GRID_HEIGHT + indexY].hovering = true"
              @mouseleave="globalState.desktopFiles[indexX * GRID_HEIGHT + indexY].hovering = false"
              class="tile-content-wrapper" ref="tileContentWrapper"
              :style="{width: `${TILE_WIDTH}px`, height: `${TILE_HEIGHT}px`, maxWidth: `${TILE_WIDTH}px`, maxHeight: `${TILE_HEIGHT}px`}"
              :draggable="applicationWindowIsResizing === false"
          >
            <div class="application-img" ref="applicationImg">
              <img :src="globalState.desktopFiles[indexX * GRID_HEIGHT + indexY]?.imageUrl" :width="IMAGE_WIDTH"
                   :height="IMAGE_HEIGHT" :alt="globalState.desktopFiles[indexX * GRID_HEIGHT + indexY]?.imageUrl">
            </div>
            <div class="application-name" ref="applicationName"
                 :class="{overflowing: globalState.desktopFiles[indexX * GRID_HEIGHT + indexY]?.overflowing}"
                 :style="{ fontSize: `${TILE_NAME_FONT_SIZE}px` }"
            >
              {{ globalState.desktopFiles[indexX * GRID_HEIGHT + indexY]?.overflowing === false ? globalState.desktopFiles[indexX * GRID_HEIGHT + indexY]?.name : `${globalState.desktopFiles[indexX * GRID_HEIGHT + indexY]?.name.substring(0, 13)}...` }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-show="contextMenuActive === true" class="context-menu" ref="contextMenu"
         :style="{ width:`${CONTEXT_MENU_WIDTH}px`, height: `${CONTEXT_MENU_HEIGHT}px`}">
      <div class="context-actions-wrapper">
        <div v-if="tileOnRightClickIsFilled" class="context-action" title="copy">
          <SvgComponent svg-type="copy" :custom-height="CONTEXT_MENU_SVG_HEIGHT" :custom-width="CONTEXT_MENU_SVG_WIDTH"
                        @clicked="contextMenuActions($event, 'copy')"/>
        </div>
        <div v-if="tileOnRightClickIsFilled" class="context-action" title="delete">
          <SvgComponent svg-type="delete" :custom-height="CONTEXT_MENU_SVG_HEIGHT"
                        :custom-width="CONTEXT_MENU_SVG_WIDTH" @clicked="contextMenuActions($event, 'delete')"/>
        </div>
        <div class="context-action" title="paste">
          <SvgComponent svg-type="paste" :custom-height="CONTEXT_MENU_SVG_HEIGHT" :custom-width="CONTEXT_MENU_SVG_WIDTH"
                        @clicked="contextMenuActions($event, 'paste')"/>
        </div>
      </div>
      <hr style="width: 90%; margin-top: 5px; margin-bottom: 5px;"/>
      <div class="context-other-actions-wrapper">
        <div v-if="tileOnRightClick?.classList.contains('filled')" class="context-action"
             @click="openApplication(globalState.desktopFiles[tileOnRightClick.id]?.name)">Open
        </div>
        <div v-if="tileOnRightClick?.classList.contains('filled')" class="context-action">Open file location</div>
        <div class="context-action" @click="init()">Restore applications</div>
      </div>
    </div>
  </div>
</template>

<script>
import {enableDragDropTouch} from "@/assets/libraries/drag-drop-touch.esm.min";
import SvgComponent from "@/components/ui/svg-component";
import {useGlobalState} from "@/stores/globalState";
import {parseFileToDbObject} from "@/utils/util";

export default {
  name: "application-grid",
  components: {SvgComponent},
  inject: ['db'],
  beforeMount() {
    this.isLoading = true;
  },
  async mounted() {
    this.showTileBorders = this.globalState.getShowGridOutlineDesktop();
    enableDragDropTouch();
    await this.init();
    window.addEventListener('keydown', this.onKeydownTile);
    window.addEventListener('resize', this.checkApplicationNameOverflow);
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeydownTile);
    window.removeEventListener('resize', this.checkApplicationNameOverflow);
  },

  data() {
    return {
      GRID_WIDTH: 0,
      GRID_HEIGHT: 0,
      IMAGE_WIDTH: 50,
      IMAGE_HEIGHT: 50,
      TILE_WIDTH: 82,
      TILE_HEIGHT: 82,
      TILE_NAME_FONT_SIZE: 10,
      CONTEXT_MENU_SVG_WIDTH: 20,
      CONTEXT_MENU_SVG_HEIGHT: 20,
      CONTEXT_MENU_WIDTH: 140,
      CONTEXT_MENU_HEIGHT: 133,
      contextMenuActive: false,
      showTileBorders: false,
      draggedTile: null,
      tileOnRightClick: null,
      tileOnHover: null,
      tileOnRightClickIsFilled: false,
      applicationWindowIsResizing: false,
      applicationNameIsOverflowing: false,
      isLoading: false,
    }
  },
  emits: ['clicked'],
  props: {
    windowSize: {
      type: Array,
      required: false
    },
    windowResizing: {
      type: Boolean,
      required: true
    }
  },
  watch: {
    'globalState.browserWindowSize': {
      async handler() {
        await this.init();
      },
      deep: true
    },
    windowResizing(newValue) {
      this.applicationWindowIsResizing = newValue;
    },
    'globalState.showGridOutlineDesktop'() {
      this.showTileBorders = this.globalState.getShowGridOutlineDesktop();
    },
    'globalState.desktopFiles': {
      handler() {
        this.$nextTick(() => {
          this.checkApplicationNameOverflow();
        });
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
    async init() {
      const browserWindowSize = this.globalState.browserWindowSize;
      if (browserWindowSize.WIDTH !== null && browserWindowSize.HEIGHT !== null) {
        this.GRID_WIDTH = Math.floor(browserWindowSize.WIDTH / this.TILE_WIDTH);
        this.GRID_HEIGHT = Math.floor((browserWindowSize.HEIGHT / this.TILE_HEIGHT) - 0.5);
      }

      const elements = await this.db.getAllElements('desktopFiles');

      for (let i = 0; i < this.GRID_WIDTH * this.GRID_HEIGHT; i++) {
        if (elements[i] !== undefined) {
          const imgUrl = URL.createObjectURL(elements[i].image);
          this.globalState.desktopFiles[i] = {
            'index': elements[i].gridIndex,
            'name': elements[i].name,
            'imageUrl': imgUrl,
            'overflowing': false,
            'hovering': false
          };
        } else {
          this.globalState.desktopFiles[i] = {
            'index': i,
            'name': null,
            'imageUrl': null,
            'overflowing': false,
            'hovering': false
          };
        }
      }
      this.globalState.desktopFiles = this.globalState.desktopFiles.sort((a, b) => a.index - b.index);
      this.isLoading = false;
    },
    contextMenuActions(e, action) {
      switch (action) {
        case 'copy': {
          if (this.tileOnRightClick.children.length > 0) {
            this.copiedApplication = this.tileOnRightClick
          }
          break;
        }
        case 'paste': {
          if (this.tileOnRightClick && this.copiedApplication) {
            this.insertTile(Number(this.tileOnRightClick.id), this.globalState.desktopFiles[this.copiedApplication.id].name);
          }
          break;
        }
        case 'delete': {
          if (this.tileOnRightClick.children.length > 0) {
            this.deleteTile(this.tileOnRightClick.id);
          }
        }
      }

      this.contextMenuActive = false;
    },
    async dragAndDropEventListenersDesktop(event, type) {
      const currentTile = event.currentTarget;

      switch (type) {
        case 'dragstart':
        case 'touchstart': {
          if (currentTile.children.length === 0) {
            return;
          }

          this.draggedTile = {
            'index': Number(currentTile.id),
            'name': this.globalState.desktopFiles[currentTile.id].name
          }

          this.createDragImage(currentTile.querySelector('.application-img'), event);
          break;
        }
        case 'dragover':
        case 'touchover': {
          event.preventDefault();
          break;
        }
        case 'drop': {
          event.preventDefault();
          if (currentTile.classList.contains('filled')) {
            return;
          }
          let items = event.dataTransfer.items;
          if (items[0]?.type !== 'text/plain') {
            if (items.length !== 0) {
              for (let i = 0; i < items.length; i++) {
                const file = items[i].getAsFile();
                const image = await this.db.getImageByFileType(file.type);
                const object = parseFileToDbObject(file, Number(currentTile.id), image);
                await this.db.postElement('files', object);
                this.insertTile(object.gridIndex, object.name);
              }
              return;
            }
          }

          const index = this.globalState.desktopFiles.findIndex(element => {
            return element.index === this.draggedTile.index;
          });

          this.deleteTile(index);
          this.insertTile(Number(currentTile.id), this.draggedTile.name)
          break;
        }
      }
    },
    isTileFillable(indexX, indexY) {
      return (
          this.globalState.desktopFiles[indexX * this.GRID_HEIGHT + indexY] !== null &&
          this.globalState.desktopFiles[indexX * this.GRID_HEIGHT + indexY]?.name !== null &&
          this.globalState.desktopFiles[indexX * this.GRID_HEIGHT + indexY]?.imageUrl !== null
      )
    },
    onClickContainer() {
      this.contextMenuActive === true ? this.contextMenuActive = false : null
      this.$emit('clicked');
    },
    onKeydownTile(e) {
      if (e.key === 'Delete') {
        if (this.tileOnHover) {
          this.deleteTile(this.tileOnHover.id);
        }
      }
      if (e.ctrlKey && e.code === 'KeyC') {
        if (this.tileOnHover.children.length > 0) {
          this.copiedApplication = this.tileOnHover;
        }
      }
      if (e.ctrlKey && e.code === 'KeyV') {
        if (this.tileOnHover && this.copiedApplication) {
          this.insertTile(Number(this.tileOnHover.id), this.globalState.desktopFiles[this.copiedApplication.id].name);
        }
      }
    },
    onRightClickTile(e) {
      const contextMenu = this.$refs.contextMenu;
      this.tileOnRightClick = e.currentTarget;

      this.tileOnRightClickIsFilled = this.tileOnRightClick.classList.contains('filled');

      if (this.contextMenuActive === false) {
        this.contextMenuActive = true;
      }

      const conditionWidth = (e.clientX + this.CONTEXT_MENU_WIDTH + 25) > this.globalState.browserWindowSize.WIDTH;
      const conditionHeight = (e.clientY + this.CONTEXT_MENU_HEIGHT + 20) > this.globalState.browserWindowSize.HEIGHT;

      const leftValue = conditionWidth ? `${this.globalState.browserWindowSize.WIDTH - this.CONTEXT_MENU_WIDTH - 25}px` : `${e.clientX}px`;
      const topValue = conditionHeight ? `${this.globalState.browserWindowSize.HEIGHT - this.CONTEXT_MENU_HEIGHT - 25}px` : `${e.clientY}px`;

      contextMenu.style.left = leftValue;
      contextMenu.style.top = topValue;
    },
    onMouseOverTile(e) {
      this.tileOnHover = e.currentTarget;
    },
    openApplication(applicationName) {
      if (applicationName === undefined) {
        return;
      }

      this.db.getElementByName('files', applicationName).then(element => {
        this.globalState.pushOpenWindow(element);
      });
    },
    deleteTile(index) {
      if (typeof this.globalState.desktopFiles[index] !== 'undefined' && this.globalState.desktopFiles[index].name !== null) {
        this.globalState.desktopFiles[index] = {
          'index': index,
          'name': null,
          'imageUrl': null,
          'overflowing': false,
          'hovering': false
        }
      }
    },
    insertTile(index, name) {
      if (typeof this.globalState.desktopFiles[index] !== 'undefined') {
        this.db.getElementByName('files', name).then(element => {
          this.globalState.desktopFiles[index] = {
            'index': index,
            'name': name,
            'imageUrl': URL.createObjectURL(element.image),
            'overflowing': false,
            'hovering': false
          }
        });
      }
    },
    createDragImage(imgElement, event) {
      if (event.type !== 'dragstart') {
        return;
      }

      const imgClone = imgElement.cloneNode(true);

      imgClone.style.width = '50px';
      imgClone.style.height = '50px';
      imgClone.style.position = 'absolute';
      imgClone.style.top = '-1000px'

      this.$el.appendChild(imgClone);

      event.dataTransfer.setDragImage(imgClone, 20, 20);
      setTimeout(() => {
        this.$el.removeChild(imgClone);
      }, 0)
    },
    checkApplicationNameOverflow() {
      if (this.$refs.tile?.length > 0) {
        this.$refs.tile.forEach(tile => {
          const applicationNameElement = tile.querySelector('.application-name');
          if (applicationNameElement && applicationNameElement.clientWidth > tile.clientWidth) {
            this.globalState.desktopFiles.map(element => {
              if (element.name === applicationNameElement.innerText) {
                element.overflowing = true;
              }
            });
          }
        });
      }
    },
    setTilesSmallSize() {
      this.IMAGE_WIDTH = 40;
      this.IMAGE_HEIGHT = 40;
      this.TILE_WIDTH = 62;
      this.TILE_HEIGHT = 62;
      this.TILE_NAME_FONT_SIZE = 7;
    },
    setTilesNormalSize() {
      this.IMAGE_WIDTH = 50;
      this.IMAGE_HEIGHT = 50;
      this.TILE_WIDTH = 82;
      this.TILE_HEIGHT = 82;
      this.TILE_NAME_FONT_SIZE = 10;
    }
  },
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.grid {
  display: flex;
  flex-direction: row;
}

.tile {
  display: flex;
  font-size: 10px;
  color: var(--font-color);
  user-select: none;
  overflow: hidden;
  width: 82px;
  height: 82px;
}

.tile-content-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.tile.filled:hover {
  background-color: var(--hover-color);
}

.tile:focus {
  outline: none;
}

.context-menu {
  display: flex;
  flex-direction: column;
  position: absolute;
  padding: 10px;
  border-radius: 10px;
  background-color: var(--background-color-window);
}

.context-actions-wrapper {
  display: flex;
  margin-left: 6px;
  gap: 9px;
  flex-direction: row;
}

.context-action {
  display: flex;
  align-items: center;
  padding: 5px;
}

.context-other-actions-wrapper {
  display: flex;
  flex-direction: column;
  font-size: 12px;
}

.context-action:hover {
  background-color: var(--hover-color);
  cursor: default;
}

.context-action path {
  fill: var(--font-color);
}
</style>