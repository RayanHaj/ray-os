<template>
  <div class="grid">
    <div class="page-header">
      <button class="back-button"
              ref="backButton"
              @click="onClickBackButton"
              disabled
      >
        back
      </button>
      <input class="file-search-field"
             type="text"
             :placeholder="this.PREFIX"
             :value="fileSystemPath.map(value => `${value.name}`).join('\\')"
             disabled
      >
      <div class="zoom-buttons">
        <button class="zoom-in-button"
                @click="zoomValue = zoomValue !== maximumZoomValue ? zoomValue += 10 : zoomValue">
          in
        </button>
        <button class="zoom-out-button"
                @click="zoomValue = zoomValue !== minimalZoomValue ? zoomValue -= 10 : zoomValue">
          out
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
          class="list-element">
        <video v-if="element.type === 'video/mp4'" :src="element.videoUrl" :id="element" class="file-thumbnail"/>
        <ImgComponent v-else-if="element.type === 'application'" :image-name="element.name" class="file-thumbnail"/>
        <SvgComponent v-else svg-type="directory" class="file-thumbnail"/>
        <div class="file-name">
          {{ element.name.length > 70 ? `${element.name.substring(0, 70)}...` : element.name }}
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import { useGlobalState } from "@/stores/globalState";
import ImgComponent from "@/ui/img-component";
import SvgComponent from "@/ui/svg-component";

export default {
  name: 'ContentGrid',
  components: {SvgComponent, ImgComponent},
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
    globalState() {
      return useGlobalState();
    }
  },
  data() {
    return {
      PREFIX: `C:\\`,
      contentList: [],
      zoomValue: 150,
      fileSystemPath: [],
      minimalZoomValue: 100,
      maximumZoomValue: 150
    }
  },
  mounted() {
    if (this.path) {
      this.fileSystemPath = this.path;
    }

    this.contentList = this.list;
  },
  methods: {
    async openDirectoryOrFile(element) {
      let directory = null;
      if (element.id) {
        directory = await this.db.getDirectoryById(element.id);
      }

      if (directory && directory.children.length > 0) {
        const children = directory.children;
        if (children.length === 0) {
          return;
        }

        this.contentList = [];
        children.forEach(child => {
          this.contentList.push(child);
        });

        if (!this.fileSystemPath.some(directory => directory.id === element.id)) {
          this.fileSystemPath.push(element);
        }

        return;
      } else if (directory && directory.children.length === 0) {
        this.contentList = [];

        if (!this.fileSystemPath.some(directory => directory.id === element.id)) {
          this.fileSystemPath.push(element);
        }
      }

      let file = null;

      if (element.name) {
        file = await this.db.getElementByName('files', element.name);
      }

      if (file) {
        switch (file.type) {
          case 'video/mp4': {
            const videoPlayerId = this.globalState.getHighestZIndex();
            this.globalState.playVideoObject = {
              id: videoPlayerId,
              video: file
            };
            this.db.getElementByName('files', 'Video Player').then(element => {
              this.globalState.pushOpenWindow(element);
            });
          }
            break;
          case 'Application': {
            this.db.getElementByName('files', file.name).then(element => {
              this.globalState.pushOpenWindow(element)
            });
          }
        }
      }
    },
    openFileSystemRoot() {
      const ROOT = 1;
      this.db.getDirectoryById(ROOT).then(directory => {
        this.contentList = [];
        this.contentList.push({
          name: directory.directoryName,
          id: directory.id,
          type: 'directory'
        });
      });
    },
    getPreviousDirectory() {
      if (this.fileSystemPath.length > 1) {
        return this.fileSystemPath[this.fileSystemPath.length - 2];
      } else if (this.fileSystemPath.length === 1) {
        return this.fileSystemPath[0];
      }
    },
    onClickBackButton() {
      const element = this.getPreviousDirectory();

      if (element.id === 0) {
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

      if (element.id !== undefined) {
        this.addDirectoryToFilePath(element);
      }

      await this.openDirectoryOrFile(element)
    },
    addDirectoryToFilePath(element) {
      if (this.fileSystemPath.length === 0) {
        this.fileSystemPath.push({
          id: 0,
          name: 'C:'
        });
      } else {
        this.fileSystemPath.push(element);
      }
    },
    removeLastDirectoryFromFilePath() {
      this.fileSystemPath.splice(this.fileSystemPath.length - 1, 1);
      if (this.fileSystemPath.length === 1) {
        this.$refs.backButton.disabled = true;
      }
    }
  }
}
</script>
<style scoped>
.grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  margin-left: 0;
  padding-left: 0;
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
}
</style>