<template>
  <div class="loader" v-if="isLoading">
    Loading...
  </div>
  <section v-else
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
             @drop.prevent="onDropTile"
             @dragstart="onDragTile"
             @touchstart="onDragTile"
             @mouseover="onMouseoverTile"
             @touchover="onMouseoverTile"
             @mouseenter="onMouseenterTileWrapper(indexX, indexY)"
             @mouseleave="onMouseleaveTileWrapper(indexX, indexY)"
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
        v-show="contextMenuActive === true"
        ref="contextMenu"
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
        @cm_primary_0="contextMenuActions($event, 'copy')"
        @cm_primary_1="contextMenuActions($event, 'delete')"
        @cm_primary_2="contextMenuActions($event, 'paste')"
        @cm_secondary_0="openApplication(globalState.desktopFiles[tileOnRightClick.id]?.name)"
        @cm_secondary_1="console.log('hello')"
        @cm_secondary_2="init()"
    />
  </section>
</template>

<script>
import {enableDragDropTouch} from "@/assets/libraries/drag-drop-touch.esm.min";
import {useGlobalState} from "@/stores/globalState";
import {parseFileToDbFileObject} from "@/utils/util";
import TileContent from "@/components/grid/TileContent";
import ContextMenu from "@/ui/ContextMenu";

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
      this.showTileBorders = this.globalState.getShowGridOutlineDesktop();
      enableDragDropTouch();

      const browserWindowSize = this.globalState.browserWindowSize;
      if (browserWindowSize.WIDTH !== null && browserWindowSize.HEIGHT !== null) {
        this.GRID_WIDTH = Math.floor(browserWindowSize.WIDTH / this.TILE_WIDTH);
        this.GRID_HEIGHT = Math.floor((browserWindowSize.HEIGHT / this.TILE_HEIGHT) - 0.5);
      }

      const desktopFileReferences = await this.db.getAllElements('desktopFiles');

      const elements = [];
      for (let reference of desktopFileReferences) {
        const file = await this.db.getFileByReferenceId('desktopFiles', reference.id);
        elements.push(file);
      }

      for (let i = 0; i < this.GRID_WIDTH * this.GRID_HEIGHT; i++) {
        if (elements[i] !== undefined) {
          const imgUrl = URL.createObjectURL(elements[i].image);
          this.globalState.desktopFiles[i] = {
            'index': i,
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

      window.addEventListener('keydown', this.onKeydownTile);
      window.addEventListener('resize', this.checkApplicationNameOverflow);
    },
    onMouseenterTileWrapper(x, y) {
      const element = this.globalState.desktopFiles[x * this.GRID_HEIGHT + y];
      if (element === undefined) return;
      element.hovering = true;
    },
    onMouseleaveTileWrapper(x, y) {
      const element = this.globalState.desktopFiles[x * this.GRID_HEIGHT + y];
      if (element === undefined) return;
      element.hovering = false;
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
    async handleFileUpload(file, tile) {
      const image = await this.db.getImageByFileType(file.type);
      const object = parseFileToDbFileObject(file.name, file.type, image, file);
      const postedFile = await this.db.postElement('files', object);
      const parsedObject = parseFileToDbFileObject(file.name, file.type, null, null, postedFile.id, true);
      await this.db.postElement('desktopFiles', parsedObject);
      this.insertTile(Number(tile.id), object.name);
    },
    async onDropTile(event) {
      const currentTile = event.currentTarget;
      if (currentTile.classList.contains('filled')) {
        return;
      }

      const items = event.dataTransfer.items;
      if (items.length === 0) {
        return;
      }

      if (items[0]?.type === 'text/plain') {
        const index = this.globalState.desktopFiles.findIndex(element => {
          return element.index === this.draggedTile.index;
        });

        this.deleteTile(index);
        this.insertTile(Number(currentTile.id), this.draggedTile.name);

        return;
      }

      for (let i = 0; i < items.length; i++) {
        const file = items[i].getAsFile();

        switch (file.type.toString()) {
          case 'video/mp4': {
            await this.handleFileUpload(file, currentTile);
            await this.db.addFileToDirectory(file.name, 'file', 'Videos');
            break;
          }
          case 'image/png':
          case 'image/jpg': {
            await this.handleFileUpload(file, currentTile);
            await this.db.addFileToDirectory(file.name, 'file', 'Pictures');
            break;
          }
        }
      }
    },
    onDragTile(event) {
      const currentTile = event.currentTarget;
      if (currentTile.children.length === 0) {
        return;
      }

      this.draggedTile = {
        'index': Number(currentTile.id),
        'name': this.globalState.desktopFiles[currentTile.id].name
      }

      this.createDragImage(currentTile.querySelector('.application-img'), event);
    },
    tileIsFilled(indexX, indexY) {
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
      console.log(contextMenu)
      this.tileOnRightClick = e.currentTarget;

      this.tileOnRightClickIsFilled = this.tileOnRightClick.classList.contains('filled');

      if (this.contextMenuActive === false) {
        this.contextMenuActive = true;
      }

      const conditionWidth = (e.clientX + this.CONTEXT_MENU_WIDTH + 25) > this.globalState.browserWindowSize.WIDTH;
      const conditionHeight = (e.clientY + this.CONTEXT_MENU_HEIGHT + 20) > this.globalState.browserWindowSize.HEIGHT;

      const leftValue = conditionWidth ? this.globalState.browserWindowSize.WIDTH - this.CONTEXT_MENU_WIDTH - 25 : e.clientX;
      const topValue = conditionHeight ? this.globalState.browserWindowSize.HEIGHT - this.CONTEXT_MENU_HEIGHT - 25 : e.clientY;

      contextMenu.leftPosition = leftValue;
      contextMenu.topPosition = topValue;
    },
    onMouseoverTile(e) {
      this.tileOnHover = e.currentTarget;
    },
    openApplication(applicationName) {
      if (applicationName === null) {
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
    getFileFromTileByPosition(x, y) {
      const file = this.globalState.desktopFiles[this.getTilePosition(x, y)]

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