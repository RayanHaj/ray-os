<template>
  <div class="grid-container" @click="onClickContainer">
    <div class="grid" v-if="GRID_HEIGHT > 0"
         @dragover.prevent="dragAndDropEventListenersDesktop($event, 'dragover')"
         @touchover.prevent="dragAndDropEventListenersDesktop($event, 'touchover')"
         @mousemove="mousePositions = {x: $event.clientX, y: $event.clientY}">
      <div v-for="(numX, indexX) in GRID_WIDTH" :key="numX" class="tile-column">
        <div v-for="(numY, indexY) in GRID_HEIGHT" :key="numY" class="tile"
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
              class="tile-content-wrapper"
              :style="{width: `${TILE_WIDTH}px`, height: `${TILE_HEIGHT}px`, maxWidth: `${TILE_WIDTH}px`, maxHeight: `${TILE_HEIGHT}px`}"
              draggable="true"
          >
            <div class="application-img">
              <ImgComponent :image-name="applicationNames[indexX * GRID_HEIGHT + indexY]" :custom-width="IMAGE_WIDTH"
                            :custom-height="IMAGE_HEIGHT"/>
            </div>
            <div class="application-name" :style="{fontSize: `${GRID_FIELD_TEXT_FONT_SIZE}px`}">
              {{ applicationNames[indexX * GRID_HEIGHT + indexY] }}
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
      </div>
    </div>
  </div>
</template>

<script>
import {compareArrays} from "@/utils/util";
import {enableDragDropTouch} from "@/assets/libraries/drag-drop-touch.esm.min";
import json from "@/assets/json/config.json"
import SvgComponent from "@/components/ui/svg-component";
import ImgComponent from "@/components/ui/img-component";

export default {
  name: "application-grid",
  components: {ImgComponent, SvgComponent},
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
      draggedTileContentClone: null,
      tileOnRightClick: null,
      tileOnHover: null,
      tileOnRightClickIsFilled: false,
      copiedApplication: null,
      listApplicationElements: [],
      applicationNames: json.applicationNames,
      mousePositions: {x: 0, y: 0},
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

        this.$el.querySelectorAll('.tile').forEach(tile => {
          if (tile.children.length !== 0) {
            tile.removeChild(tile.querySelector('.tile-content-wrapper'));

            if (tile.classList.contains('filled')) {
              tile.classList.remove('filled');
            }
          }
        });
        this.addApplicationsToGrid();
      }
    },
    windowResizing(newValue) {
      this.$el.querySelectorAll('.tile').forEach(tile => {
        const contentWrapper = tile.querySelector('.tile-content-wrapper');
        const image = tile.querySelector('.image');

        if (contentWrapper && image) {
          contentWrapper.draggable = !newValue;
          image.draggable = !newValue;
        }
      });
    }
  },
  methods: {
    init() {
      this.$el.querySelectorAll('.tile').forEach(tile => {
        if (tile.children.length !== 0) {
          const tileContentWrapper = tile.querySelector('.tile-content-wrapper');
          const applicationName = tile.querySelector('.application-name').innerText;
          this.listApplicationElements[this.applicationNames.indexOf(applicationName)] = tileContentWrapper;
        }
      });

      if (this.windowSize[0] !== null && this.windowSize[1] !== null) {
        this.GRID_WIDTH = Math.floor(this.windowSize[0] / this.TILE_WIDTH);
        this.GRID_HEIGHT = Math.floor((this.windowSize[1] / this.TILE_HEIGHT));
      }
    },
    onClickContainer() {
      this.contextMenuActive === true ? this.contextMenuActive = false : null;
      this.$emit('clicked');
    },
    onKeydownTile(event) {
      event.preventDefault();
      if (event.key === 'Delete') {
        if (this.tileOnHover) {
          this.tileOnHover.classList.remove('filled');
          this.tileOnHover.innerHTML = '';
        }
      }
      if (event.ctrlKey && event.code === 'KeyC') {
        if (this.tileOnHover.querySelector('.tile-content-wrapper')) {
          this.copiedApplication = this.tileOnHover;
        }
      }
      if (event.ctrlKey && event.code === 'KeyV') {
        const tileAtMousePosition = this.getTileByPosition(this.mousePositions.x, this.mousePositions.y);

        if (!tileAtMousePosition ||
            this.copiedApplication === null ||
            tileAtMousePosition.classList.contains('filled')) {
          return;
        }

        const parentClone = this.copiedApplication.cloneNode(true);
        parentClone.classList.remove('selected')

        const childClone = parentClone.children[0];
        this.fillTile(childClone, tileAtMousePosition);
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
    onDoubleClick(event) {
      const tile = event.currentTarget;
      if (!tile.querySelector('.tile-content-wrapper')) return;
      this.$emit('applicationName', tile.querySelector('.application-name').innerText);
    },
    contextMenuActions(e, action) {
      switch (action) {
        case 'copy': {
          this.copiedApplication = this.tileOnRightClick.cloneNode(true);
          break;
        }
        case 'paste': {
          if (this.copiedApplication === null || this.tileOnRightClick === null) {
            return;
          }
          const currentTileContent = this.tileOnRightClick.querySelector('.tile-content-wrapper');
          const copiedTileContent = this.copiedApplication.querySelector('.tile-content-wrapper');
          if (copiedTileContent !== null && currentTileContent === null) {
            this.tileOnRightClick.innerHTML = '';
            this.tileOnRightClick.classList.add('filled');
            this.tileOnRightClick.appendChild(copiedTileContent.cloneNode(true));
          }
          break;
        }
        case 'delete': {
          if (this.tileOnRightClick.querySelector('.tile-content-wrapper')) {
            this.tileOnRightClick.classList.remove('filled');
            this.tileOnRightClick.innerHTML = '';
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

          this.draggedTile = currentTile;
          this.draggedTileContentClone = currentTile.querySelector('.tile-content-wrapper').cloneNode(true);

          this.createDragImage(this.draggedTile.querySelector('.application-img'), event);
          break;
        }
        case 'dragover':
        case 'touchover': {
          event.preventDefault();
          break;
        }
        case 'drop': {
          if (this.draggedTileContentClone === null || currentTile.children.length !== 0) {
            return;
          }

          currentTile.classList.add('filled');
          currentTile.appendChild(this.draggedTileContentClone);
          this.draggedTile.innerHTML = "";
          this.draggedTile.classList.remove('filled');

          break;
        }
      }
    },
    getTileByPosition(xPos, yPos) {
      const element = document.elementFromPoint(xPos, yPos);
      if (!element.classList.contains('tile')) {
        return;
      }

      return element;
    },
    fillTile(tileContent, tile) {
      tile.appendChild(tileContent);
      tile.classList.add('filled');
    },
    addApplicationsToGrid() {
      this.$el.querySelectorAll('.tile').forEach((tile, index) => {
        if (typeof this.listApplicationElements[index] !== 'undefined') {
          this.fillTile(this.listApplicationElements[index], tile);
        }
      });
    },
    isTileFillable(indexX, indexY) {
      return (
          indexY < this.applicationNames.length &&
          indexX <= Math.floor(this.applicationNames.length / this.GRID_HEIGHT) &&
          typeof this.applicationNames[indexX * this.GRID_HEIGHT + indexY] !== 'undefined'
      )
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