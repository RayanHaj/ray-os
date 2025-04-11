<template>
  <section v-if="!isLoading"
           class="grid-container"
           @click="onClickContainer"
  >
    <div v-if="GRID_HEIGHT > 0"
         class="grid"
         @dragover.prevent
         @touchover.prevent
    >
      <div v-for="(numX, indexX) in GRID_WIDTH"
           :key="numX"
           class="tile-column"
      >
        <div v-for="(numY, indexY) in GRID_HEIGHT"
             :key="numY"
             class="tile"
             ref="tile"
             :id="getTilePosition(indexX, indexY)"
             :class="{ 'filled': tileIsFilled(indexX, indexY) }"
             @drop.prevent="onTileDrop"
             @dragstart="onTileDrag"
             @touchstart="onTileDrag"
             @mouseover="onTileMouseover"
             @touchover="onTileMouseover"
             @mouseenter="onTileMouseenter(indexX, indexY)"
             @mouseleave="onTileMouseleave(indexX, indexY)"
             @dblclick="openApplication(getFileFromTileByPosition(indexX, indexY)?.name)"
             @contextmenu.prevent="onRightClickTile"
             :style="{ border: `${ this.showTileBorders ? '1px solid white' : 'none' }` }"
             tabindex="0"
        >
          <TileContent v-if="tileIsFilled(indexX, indexY)"
                       :tile-position="getTilePosition(indexX, indexY)"
                       :draggable="applicationWindowIsResizing === false"
          />
        </div>
      </div>
    </div>

    <ContextMenu
        v-if="contextMenuActive === true"
        :position="onRightClickMousePosition"
        :primary-context-actions="[
            {name: 'copy', active: tileOnRightClickIsFilled},
            {name: 'delete', active: tileOnRightClickIsFilled},
            {name: 'paste', active: true}
        ]"
        :secondary-context-actions="[
            {name: 'Open', active: tileOnRightClickIsFilled},
            {name: 'Open file location', active: tileOnRightClickIsFilled},
            {name: 'Restore applications', active: true}
        ]"
        @cm_primary_0="onContextMenuCopy"
        @cm_primary_1="onContextMenuDelete"
        @cm_primary_2="onContextMenuPaste"
        @cm_secondary_0="openApplication(fileStore.desktopFiles[tileOnRightClick.id]?.name)"
        @cm_secondary_1="console.log('hello')"
        @cm_secondary_2="init()"

        @close="contextMenuActive = false"
    />
  </section>
</template>

<script>
import {enableDragDropTouch} from "@/assets/libraries/drag-drop-touch.esm.min";
import {useFileStore, useGlobalStore, usePreferencesStore, useWindowStore} from "@/stores/globalState";
import {parseFileToDbFileObject} from "@/utils/util";
import TileContent from "@/components/grid/TileContent";
import ContextMenu from "@/ui/ContextMenu";
import {mapStores} from "pinia";

export default {
  name: "desktop-grid",
  components: {ContextMenu, TileContent},
  inject: ['db'],
  beforeMount() {
    this.isLoading = true;
  },
  async mounted() {
    await this.init();
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
      contextMenuActive: false,
      showTileBorders: false,
      draggedTile: null,
      tileOnRightClick: null,
      tileOnHover: null,
      tileOnRightClickIsFilled: false,
      applicationWindowIsResizing: false,
      applicationNameIsOverflowing: false,
      isLoading: false,
      onRightClickMousePosition: null
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
    'globalStore.browserWindowSize': {
      async handler() {
        await this.init();
      },
      deep: true
    },
    windowResizing(newValue) {
      this.applicationWindowIsResizing = newValue;
    },
    'preferencesStore.showGridOutlineDesktop'() {
      this.showTileBorders = this.preferencesStore.getShowGridOutlineDesktop();
    },
    'fileStore.desktopFiles': {
      handler() {
        this.$nextTick(() => {
          this.checkApplicationNameOverflow();
        });
      },
      deep: true
    }
  },
  computed: {
    ...mapStores(usePreferencesStore, useWindowStore, useGlobalStore, useFileStore)
  },
  methods: {
    async init() {
      this.showTileBorders = this.preferencesStore.getShowGridOutlineDesktop();
      enableDragDropTouch();
      this.updateGridWidthHeight();
      await this.setDesktopTiles().then(() => this.isLoading = false);
      window.addEventListener('keydown', this.onKeydownTile);
      window.addEventListener('resize', this.checkApplicationNameOverflow);
    },
    updateGridWidthHeight() {
      const browserWindowSize = this.globalStore.browserWindowSize;
      if (browserWindowSize.WIDTH !== null && browserWindowSize.HEIGHT !== null) {
        this.GRID_WIDTH = Math.floor(browserWindowSize.WIDTH / this.TILE_WIDTH);
        this.GRID_HEIGHT = Math.floor((browserWindowSize.HEIGHT / this.TILE_HEIGHT) - 0.5);
      }
    },
    async setDesktopTiles() {
      const desktopFileReferences = await this.db.getAllElements('desktopFiles');

      const elements = [];
      for (let reference of desktopFileReferences) {
        const file = await this.db.getFileByReferenceId('desktopFiles', reference.id);
        elements.push(file);
      }

      for (let i = 0; i < this.GRID_WIDTH * this.GRID_HEIGHT; i++) {
        if (elements[i] !== undefined) {
          this.fileStore.desktopFiles[i] = {
            'index': i,
            'name': elements[i].name,
            'overflowing': false,
            'hovering': false
          };
        } else {
          this.fileStore.desktopFiles[i] = {
            'index': i,
            'name': null,
            'overflowing': false,
            'hovering': false
          };
        }
      }

      this.fileStore.desktopFiles = this.fileStore.desktopFiles.sort((a, b) => a.index - b.index);
      this.fileStore.desktopFiles = this.fileStore.desktopFiles.sort((a, b) => a.index - b.index);
    },
    onTileMouseenter(x, y) {
      const element = this.fileStore.desktopFiles[x * this.GRID_HEIGHT + y];
      if (element === undefined) return;
      element.hovering = true;
    },
    onTileMouseleave(x, y) {
      this.tileOnHover = null;
      const element = this.fileStore.desktopFiles[x * this.GRID_HEIGHT + y];
      if (element === undefined) return;
      element.hovering = false;
    },
    onContextMenuCopy() {
      if (this.tileOnRightClick.children.length > 0) {
       this.copiedApplication = this.tileOnRightClick;
      }

      this.contextMenuActive = false;
    },
    onContextMenuPaste() {
      if (this.tileOnRightClick && this.copiedApplication) {
        this.insertTile(Number(this.tileOnRightClick.id), this.fileStore.desktopFiles[this.copiedApplication.id].name);
      }

      this.contextMenuActive = false;
    },
    onContextMenuDelete() {
      if (this.tileOnRightClick.children.length > 0) {
        this.deleteTile(this.tileOnRightClick.id);
      }

      this.contextMenuActive = false;
    },
    async handleFileUpload(file, tile) {
      const object = parseFileToDbFileObject(file.name, file.type, file);
      const postedFile = await this.db.postElement('files', object);
      const parsedObject = parseFileToDbFileObject(file.name, file.type, null, postedFile.id, true);
      await this.db.postElement('desktopFiles', parsedObject);
      this.insertTile(Number(tile.id), object.name);
    },
    async onTileDrop(event) {
      const currentTile = event.currentTarget;
      if (currentTile.classList.contains('filled')) {
        return;
      }

      if (this.draggedTile !== null) {
        this.deleteTile(this.draggedTile.index);
        this.insertTile(Number(currentTile.id), this.draggedTile.name);
        this.draggedTile = null;
        return;
      }

      const items = event.dataTransfer.items;
      if (items.length === 0) {
        return;
      }

      await this.handleFiles(items, currentTile);
    },
    async handleFiles(items, tile) {
      for (let i = 0; i < items.length; i++) {
        const file = items[i].getAsFile();

        switch (file.type.toString()) {
          case 'video/mp4': {
            await this.handleFileUpload(file, tile);
            await this.db.addFileToDirectory(file.name, file.type, 'Videos');
            break;
          }
          case 'image/png':
          case 'image/jpg': {
            await this.handleFileUpload(file, tile);
            await this.db.addFileToDirectory(file.name, file.type, 'Pictures');
            break;
          }
        }
      }
    },
    onTileDrag(event) {
      const currentTile = event.currentTarget;
      if (currentTile.children.length === 0) {
        return;
      }

      this.draggedTile = {
        'index': Number(currentTile.id),
        'name': this.fileStore.desktopFiles[currentTile.id].name
      }

      this.createDragImage(currentTile.querySelector('.application-img'), event);
    },
    tileIsFilled(indexX, indexY) {
      return (
          this.fileStore.desktopFiles[indexX * this.GRID_HEIGHT + indexY] !== null &&
          this.fileStore.desktopFiles[indexX * this.GRID_HEIGHT + indexY]?.name !== null
      )
    },
    onClickContainer() {
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
          this.insertTile(Number(this.tileOnHover.id), this.fileStore.desktopFiles[this.copiedApplication.id].name);
        }
      }
    },
    onRightClickTile(e) {
      this.tileOnRightClick = e.currentTarget;
      this.tileOnRightClickIsFilled = this.tileOnRightClick.classList.contains('filled');

      this.onRightClickMousePosition = {
        x: e.clientX,
        y: e.clientY
      }

      if (this.contextMenuActive === false) {
        this.contextMenuActive = true;
      }
    },
    onTileMouseover(e) {
      this.tileOnHover = e.currentTarget;
    },
    openApplication(applicationName) {
      if (applicationName === null) {
        return;
      }

      this.db.getElementByName('files', applicationName).then(element => {
        this.windowStore.pushOpenWindow(element);
      });
    },
    deleteTile(index) {
      if (typeof this.fileStore.desktopFiles[index] !== 'undefined' && this.fileStore.desktopFiles[index].name !== null) {
        this.fileStore.desktopFiles[index] = {
          'index': index,
          'name': null,
          'overflowing': false,
          'hovering': false
        }
      }
    },
    insertTile(index, name) {
      if (typeof this.fileStore.desktopFiles[index] !== 'undefined') {
        this.fileStore.desktopFiles[index] = {
          'index': index,
          'name': name,
          'overflowing': false,
          'hovering': false
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
    checkApplicationNameOverflow() {
      if (this.$refs.tile?.length > 0) {
        this.$refs.tile.forEach(tile => {
          const applicationNameElement = tile.querySelector('.application-name');
          if (applicationNameElement && applicationNameElement.clientWidth > tile.clientWidth) {
            this.fileStore.desktopFiles.map(element => {
              if (element.name === applicationNameElement.innerText) {
                element.overflowing = true;
              }
            });
          }
        });
      }
    },
    getFileFromTileByPosition(x, y) {
      const file = this.fileStore.desktopFiles[this.getTilePosition(x, y)]

      if (!file) {
        return null;
      }

      return file;
    },
    getTilePosition(x, y) {
      return x * this.GRID_HEIGHT + y;
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

.tile.filled:hover {
  background-color: var(--hover-color);
}

.tile:focus {
  outline: none;
}
</style>