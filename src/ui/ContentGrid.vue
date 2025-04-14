<template>
  <section class="grid"
           @keydown="onKeydownShift"
           @keyup="onKeyupShift"
           tabindex="0"
  >
    <div class="page-header">
      <button class="back-button btn"
              ref="backButton"
              @click="onClickBackButton"
              disabled
      >
        <SvgComponent svg-type="arrowUp" :custom-height="25" :custom-width="25"/>
      </button>
      <input class="file-search-field"
             type="text"
             :placeholder="this.PREFIX"
             :value="fileSystemPath.map(value => `${value.name}`).join('\\')"
             disabled
      >
      <div class="zoom-buttons">
        <button class="zoom-in-button btn"
                @click="increaseZoomValue">
          <SvgComponent svg-type="zoomIn" :custom-height="25" :custom-width="25"/>
        </button>
        <button class="zoom-out-button btn"
                @click="decreaseZoomValue">
          <SvgComponent svg-type="zoomOut" :custom-height="25" :custom-width="25"/>
        </button>
      </div>
    </div>
    <div v-if="contentList.length === 0">
      <p>No {{ name }} found</p>
    </div>
    <ul v-else class="file-list-wrapper">
      <li v-for="element in contentList"
          @dblclick="onDblClick(element)"
          :key="element.name"
          :style="{
            width: `${zoomValue}px`,
            height: `${zoomValue}px`
          }"
          class="list-element"
          @contextmenu.prevent="onRightClickFile($event, element.id)"
      >
        <SvgComponent :svg-type="getSvgName(element)" :custom-width="zoomValue" :custom-height="zoomValue"/>

        <input v-if="currentFileRenameId === element.id" type="text" class="file-name custom-input" :value="element.name.length > 70 ? `${element.name.substring(0, 70)}...` : element.name">
        <div v-else
             class="file-name"
             :style="{fontSize: `${FILE_NAME_FONT_SIZE}px`}"
        >
          {{ element.name.length > 70 ? `${element.name.substring(0, 70)}...` : element.name }}
        </div>
      </li>
    </ul>
    <ContextMenu
        v-if="contextMenuActive === true"
        :position="onRightClickMousePosition"
        :primary-context-actions="[
            {name: 'copy', active: true},
            {name: 'delete', active: true},
            {name: 'paste', active: true}
        ]"
        :secondary-context-actions="[
            {name: 'Rename file', active: true},
            {name: 'Open file location', active: true},
            {name: 'Restore applications', active: true}
        ]"
        @cm_primary_0="console.log('copyClicked')"
        @cm_primary_1="console.log('deleteClicked')"
        @cm_primary_2="console.log('pasteClicked')"
        @cm_secondary_0="currentFileRenameId = currentRightClickedElementId"
        @cm_secondary_1="console.log('hello')"
        @cm_secondary_2="console.log('restore')"

        @close="contextMenuActive = false"
    />
  </section>
</template>
<script>
import {useApplicationStatesStore, useWindowStore} from "@/stores/globalState";
import SvgComponent from "@/ui/svg-component";
import ContextMenu from "@/ui/ContextMenu.vue";

export default {
  name: 'ContentGrid',
  components: {ContextMenu, SvgComponent},
  inject: ['db'],
  props: {
    path: {
      required: false
    },
    name: {
      default: 'elements',
      required: false
    },
    list: {
      default: [],
      required: true
    }
  },
  computed: {
    stores() {
      return {
        'windowStore': useWindowStore(),
        'applicationStatesStore': useApplicationStatesStore()
      }
    },
  },
  data() {
    return {
      PREFIX: `C:\\`,
      contentList: [],
      zoomValue: 150,
      fileSystemPath: [],
      minimumZoomValue: 100,
      maximumZoomValue: 150,
      FILE_NAME_FONT_SIZE: 12,
      currentFileRenameId: 0,
      contextMenuActive: false,
      currentRightClickedElementId: null,
      onRightClickMousePosition: null
    }
  },
  beforeMount() {
    const zoomValueLS = localStorage.getItem('zoomValue');
    if (zoomValueLS) {
      this.zoomValue = Number(zoomValueLS);
    }

    this.updateFontSize();
  },
  mounted() {
    if (this.path) {
      this.fileSystemPath = this.path;
    }

    this.contentList = this.list;
  },
  methods: {
    onRightClickFile(e, id) {
      const rect = this.$el.getBoundingClientRect();
      this.onRightClickMousePosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top + 35
      }

      this.contextMenuActive = true;
      this.currentRightClickedElementId = id;
    },
    async openDirectoryOrFile(element) {
      await this.db.getDirectoryById(element.id).then(async directory => {
        if (!directory) {
          await this.openFileByName(element.name);
          return;
        }

        this.contentList = [];
        if (!this.fileSystemPath.some(directory => directory.id === element.id)) {
          this.fileSystemPath.push(element);
        }

        if (directory.children.length === 0) {
          return;
        }

        directory.children.forEach(child => {
          this.contentList.push(child);
        });

        console.log(this.contentList)
      }).catch(error => {
        console.error(error);
      });
    },
    async openFileByName(name) {
      let file = null;

      if (name) {
        file = await this.db.getElementByName('files', name);
      }

      if (file) {
        switch (file.type) {
          case 'video/mp4': {
            const videoPlayerId = this.stores.windowStore.getHighestZIndex();
            this.stores.applicationStatesStore.playVideoObject = {
              id: videoPlayerId,
              video: file
            };
            this.db.getElementByName('files', 'Video Player').then(element => {
              this.stores.windowStore.pushOpenWindow(element);
            });
          }
            break;
          case 'Application': {
            this.db.getElementByName('files', file.name).then(element => {
              this.stores.windowStore.pushOpenWindow(element)
            });
          }
        }
      }
    },
    openFileSystemRoot() {
      const defaultDirectoryId = 1;
      this.db.getDirectoryById(defaultDirectoryId).then(directory => {
        this.contentList = [];

        const defaultDirectoryObject = {
          name: directory.directoryName,
          id: directory.id,
          type: 'directory'
        }

        this.contentList.push(defaultDirectoryObject);
      });
    },
    getPreviousDirectory() {
      if (this.fileSystemPath.length > 1) {
        return this.fileSystemPath[this.fileSystemPath.length - 2];
      }
      if (this.fileSystemPath.length === 1) {
        return this.fileSystemPath[0];
      }
    },
    onClickBackButton() {
      const element = this.getPreviousDirectory();

      const rootId = 0;
      if (element.id === rootId) {
        this.openFileSystemRoot();
      } else {
        this.openDirectoryOrFile(element);
      }

      this.removeLastDirectoryFromFilePath();
    },
    async onDblClick(element) {
      if (this.$refs.backButton.disabled) {
        this.$refs.backButton.disabled = false;
      }

      if (element.type === 'directory') {
        this.addDirectoryToFilePath(element);
      }

      await this.openDirectoryOrFile(element)
    },
    addDirectoryToFilePath(element) {
      if (this.fileSystemPath.length === 0) {
        const root = {
          id: 0,
          name: 'C:'
        }
        this.fileSystemPath.push(root);
      } else {
        this.fileSystemPath.push(element);
      }
    },
    removeLastDirectoryFromFilePath() {
      this.fileSystemPath.splice(this.fileSystemPath.length - 1, 1);

      // disable button because it reached root
      if (this.fileSystemPath.length === 1) {
        this.$refs.backButton.disabled = true;
      }
    },
    onKeydownShift(e) {
      if (e.key !== 'Shift') return;

      this.$el.addEventListener('wheel', this.onScrollWheel);
    },
    onKeyupShift(e) {
      if (e.key !== 'Shift') return;

      this.$el.removeEventListener('wheel', this.onScrollWheel);
    },
    onScrollWheel(e) {
      if (e.deltaY > 0) {
        this.decreaseZoomValue();
        return;
      }

      this.increaseZoomValue();
    },
    increaseZoomValue() {
      this.zoomValue = this.zoomValue !== this.maximumZoomValue ? this.zoomValue += 10 : this.zoomValue;
      localStorage.setItem('zoomValue', this.zoomValue);
      this.updateFontSize();
    },
    decreaseZoomValue() {
      this.zoomValue = this.zoomValue !== this.minimumZoomValue ? this.zoomValue -= 10 : this.zoomValue;
      localStorage.setItem('zoomValue', this.zoomValue);
      this.updateFontSize();
    },
    updateFontSize() {
      const maxFontSize = 17;
      const minFontSize = 12;

      const calculationFontSize = maxFontSize - ((this.maximumZoomValue / 10) - (this.zoomValue / 10));
      if (calculationFontSize > minFontSize) {
        this.FILE_NAME_FONT_SIZE = maxFontSize - ((this.maximumZoomValue / 10) - (this.zoomValue / 10));
      }
    },
    getSvgName(element) {
      if (!element) return;

      let svgName = null;
      switch (element.type) {
        case 'Application': {
          svgName = `os${element.name[0].toUpperCase()}${element.name.replaceAll(' ', '').slice(1)}`;
        } break;
        case 'video/mp4': {
          svgName = `osPlay`;
        } break;
      }

      if (svgName === null) {
        svgName = 'osFileExplorer'
      }

      return svgName;
    }
  }
}
</script>
<style scoped>
* {
  box-sizing: border-box;
}
.grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  margin-left: 0;
  padding-left: 0;
}

.btn {
  background-color: var(--border-input-color);
}

.btn:disabled, SvgComponent {
  fill: rgba(0, 0, 0, 0.1);
  background-color: rgba(0, 0, 0, 0.1);
}

ul {
  padding: 0;
}

.file-search-field {
  width: 60%;
}

.zoom-buttons {
  width: 20%;
}

.zoom-in-button, .zoom-out-button {
  width: 50%;
}

.back-button {
  width: 20%;
}

.page-header {
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
}

.file-list-wrapper {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  user-select: none;
}

.file-thumbnail {
  width: 70%;
  pointer-events: none;
}

.file-name {
  overflow-wrap: anywhere;
}

.custom-input {
  all: unset;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  outline: none;
  border: none;
  background: none;
  box-shadow: none;
  user-select: none;
  cursor: default;
  width: 100%;
  text-align: center;
}

.list-element {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  padding: 5px;
  overflow-wrap: break-word;
}

.list-element:hover {
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
}
</style>