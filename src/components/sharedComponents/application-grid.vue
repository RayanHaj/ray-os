<template>
  <div class="grid-container" ref="gridContainer" @click="onClickContainer">
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
             @dblclick="onDoubleClick"
             @contextmenu.prevent="onRightClickTile"
             tabindex="0"
             :style="{
              width: `${TILE_WIDTH}px`,
              height: `${TILE_HEIGHT}px`,
              maxWidth: `${TILE_WIDTH}px`,
              maxHeight: `${TILE_HEIGHT}px`
            }"
        >
          <div
              v-if="isTileFillable(indexX, indexY)"
              class="tile-content-wrapper" ref="tileContentWrapper"
              :style="{width: `${TILE_WIDTH}px`, height: `${TILE_HEIGHT}px`, maxWidth: `${TILE_WIDTH}px`, maxHeight: `${TILE_HEIGHT}px`}"
              :draggable="applicationWindowIsResizing === false"
          >
            <div class="application-img" ref="applicationImg">
              <img :src="getImgUrl(listApplicationElements[indexX * GRID_HEIGHT + indexY].name)" :width="IMAGE_WIDTH"
                   :height="IMAGE_HEIGHT" :alt="listApplicationElements[indexX * GRID_HEIGHT + indexY].name">
            </div>
            <div class="application-name" ref="applicationName" :style="{fontSize: `${GRID_FIELD_TEXT_FONT_SIZE}px`}">
              {{ listApplicationElements[indexX * GRID_HEIGHT + indexY].name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-show="contextMenuActive === true" class="context-menu" ref="contextMenu">
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
        <div class="context-action">Open</div>
        <div class="context-action">Open file location</div>
        <div class="context-action" @click="init()">Restore applications</div>
      </div>
    </div>
  </div>
</template>

<script>
import {compareArrays, parseApplicationNameToImageNameFormat} from "@/utils/util";
import {enableDragDropTouch} from "@/assets/libraries/drag-drop-touch.esm.min";
import json from "@/assets/json/config.json"
import SvgComponent from "@/components/ui/svg-component";

export default {
  name: "application-grid",
  components: {SvgComponent},

  mounted() {
    this.$nextTick(() => {
      enableDragDropTouch();
      this.init();
      window.addEventListener('keydown', this.onKeydownTile);
    });
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeydownTile);
  },

  data() {
    return {
      GRID_WIDTH: 0,
      GRID_HEIGHT: 0,
      IMAGE_WIDTH: 50,
      IMAGE_HEIGHT: 50,
      TILE_WIDTH: 82,
      TILE_HEIGHT: 82,
      GRID_FIELD_TEXT_FONT_SIZE: 10,
      CONTEXT_MENU_SVG_WIDTH: 20,
      CONTEXT_MENU_SVG_HEIGHT: 20,
      contextMenuActive: false,
      draggedTile: null,
      tileOnRightClick: null,
      tileOnHover: null,
      tileOnRightClickIsFilled: false,
      applicationWindowIsResizing: false,
      listApplicationElements: [],
      applicationNames: json.applicationNames,
    }
  },
  emits: ['clicked', 'applicationName'],
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
    windowSize(newSize, oldSize) {
      if (compareArrays(oldSize, newSize) === false) {
        this.init();

        // IMPLEMENT

        // const width = this.$refs.gridContainer.clientWidth;
        // const height = this.$refs.gridContainer.clientHeight;
        // if (width < 500 || height < 400) {
        //   this.setTilesSmallSize();
        // } else {
        //   this.setTilesNormalSize();
        // }
      }
    },
    windowResizing(newValue) {
      this.applicationWindowIsResizing = newValue;
    }
  },
  methods: {
    init() {
      if (this.windowSize[0] !== null && this.windowSize[1] !== null) {
        this.GRID_WIDTH = Math.floor(this.windowSize[0] / this.TILE_WIDTH);
        this.GRID_HEIGHT = Math.floor((this.windowSize[1] / this.TILE_HEIGHT));
      }

      for (let i = 0; i < this.GRID_WIDTH * this.GRID_HEIGHT; i++) {
        if (this.applicationNames.length - 1 >= i) {
          this.listApplicationElements[i] = {
            'index': i,
            'name': this.applicationNames[i]
          };
        } else {
          this.listApplicationElements[i] = {
            'index': i,
            'name': null
          };
        }
      }
    },
    contextMenuActions(e, action) {
      switch (action) {
        case 'copy': {
          if (this.tileOnRightClick.querySelector('.tile-content-wrapper')) {
            this.copiedApplication = this.tileOnRightClick
          }
          break;
        }
        case 'paste': {
          if (this.tileOnRightClick && this.copiedApplication) {
            this.insertTile(Number(this.tileOnRightClick.id), this.copiedApplication.querySelector('.application-name').innerText);
          }
          break;
        }
        case 'delete': {
          if (this.tileOnRightClick.querySelector('.tile-content-wrapper')) {
            this.deleteTile(this.tileOnRightClick.id);
          }
        }
      }

      this.contextMenuActive = false;
    },
    dragAndDropEventListenersDesktop(event, type) {
      const currentTile = event.currentTarget;

      switch (type) {
        case 'dragstart':
        case 'touchstart': {
          if (currentTile.children.length === 0) {
            return;
          }

          this.draggedTile = {
            'index': Number(currentTile.id),
            'name': currentTile.querySelector('.application-name').innerText
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
          const index = this.listApplicationElements.findIndex(element => {
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
          this.listApplicationElements[indexX * this.GRID_HEIGHT + indexY] !== null &&
          this.listApplicationElements[indexX * this.GRID_HEIGHT + indexY].name !== null
      )
    },
    onClickContainer() {
      this.contextMenuActive === true ? this.contextMenuActive = false : null;
      this.$emit('clicked');
    },
    onKeydownTile(e) {
      e.preventDefault();
      if (e.key === 'Delete') {
        if (this.tileOnHover) {
          this.deleteTile(this.tileOnHover.id);
        }
      }
      if (e.ctrlKey && e.code === 'KeyC') {
        if (this.tileOnHover.querySelector('.tile-content-wrapper')) {
          this.copiedApplication = this.tileOnHover;
        }
      }
      if (e.ctrlKey && e.code === 'KeyV') {
        if (this.tileOnHover && this.copiedApplication) {
          this.insertTile(Number(this.tileOnHover.id), this.copiedApplication.querySelector('.application-name').innerText);
        }
      }
    },
    onRightClickTile(e) {
      const contextMenu = this.$refs.contextMenu;
      this.tileOnRightClick = e.currentTarget;

      this.tileOnRightClickIsFilled = !!this.tileOnRightClick.querySelector('.tile-content-wrapper');

      if (this.contextMenuActive === false) {
        this.contextMenuActive = true;
      }

      contextMenu.style.left = `${e.clientX}px`;
      contextMenu.style.top = `${e.clientY}px`;
    },
    onMouseOverTile(e) {
      this.tileOnHover = e.currentTarget;
    },
    onDoubleClick(e) {
      const tile = e.currentTarget;
      if (!tile.querySelector('.tile-content-wrapper')) return;
      this.$emit('applicationName', tile.querySelector('.application-name').innerText);
    },
    deleteTile(index) {
      if (typeof this.listApplicationElements[index] !== 'undefined' && this.listApplicationElements[index].name !== null) {
        this.listApplicationElements[index] = {
          'index': index,
          'name': null
        }
      }
    },
    insertTile(index, name) {
      if (typeof this.listApplicationElements[index] !== 'undefined') {
        this.listApplicationElements[index] = {
          'index': index,
          'name': name
        }
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
    getImgUrl(name) {
      const parsedName = parseApplicationNameToImageNameFormat(name);
      return require(`@/assets/images/applicationImages/${parsedName}.png`);
    },
    setTilesSmallSize() {
      this.IMAGE_WIDTH = 40;
      this.IMAGE_HEIGHT = 40;
      this.TILE_WIDTH = 62;
      this.TILE_HEIGHT = 62;
      this.GRID_FIELD_TEXT_FONT_SIZE = 7;
    },
    setTilesNormalSize() {
      this.IMAGE_WIDTH = 50;
      this.IMAGE_HEIGHT = 50;
      this.TILE_WIDTH = 82;
      this.TILE_HEIGHT = 82;
      this.GRID_FIELD_TEXT_FONT_SIZE = 10;
    }
  },
}
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-auto-flow: row;
  grid-template-columns: auto;
  grid-template-rows: auto;
  align-items: center;
  justify-items: center;
}

.grid {
  display: flex;
  flex-direction: row;
  position: relative;
}

.tile {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  color: white;
  user-select: none;
}

.tile-content-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.tile.filled:hover {
  background-color: rgba(190, 190, 190, 0.5);
}

.tile.filled.selected {
  background-color: rgba(190, 190, 190, 0.5);
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