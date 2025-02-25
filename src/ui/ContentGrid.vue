<template>
  <div class="grid">
    <div class="page-header">
      <button class="back-button"
              @click="onClickBackButton">
        (
      </button>
        <input class="file-search-field"
               type="text"
               :placeholder="this.PREFIX"
               :value="fileSystemPath"
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
import {useGlobalState} from "@/stores/globalState";
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
      enteredDirectories: [],
      zoomValue: 150,
      fileSystemPath: '',
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
      if (element.id !== undefined) {
        const children = await this.db.getDirectoryById(element.id).then(directory => {
          return directory.children
        });
        if (children.length === 0) {
          return;
        }

        this.contentList = [];
        children.forEach(child => {
          this.contentList.push(child);
        });

        if (!this.enteredDirectories.some(directory => directory.id === element.id)) {
          this.enteredDirectories.push(element);
        }
      } else {
        if (element.name !== undefined) {
          const file = await this.db.getElementByName('files', element.name);

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
      }
    },
    openFileSystemRoot() {
      const ROOT = 1;
      this.db.getDirectoryById(ROOT).then(directory => {
        this.contentList = [];
        this.contentList.push({
          id: directory.id,
          name: directory.directoryName
        });
      });
    },
    getPreviousDirectory() {
      if (this.enteredDirectories.length === 0) {
        return 'n';
      } else if (this.enteredDirectories.length === 1) {
        return 'root';
      } else {
        return this.enteredDirectories[this.enteredDirectories.length - 2];
      }
    },
    onClickBackButton() {
      const element = this.getPreviousDirectory();

      if (element === 'root') {
        this.openFileSystemRoot();
      } else {
        this.openDirectoryOrFile(element);

        // const index = this.enteredDirectories.findIndex(directory => directory.id === element.id);
        // this.enteredDirectories.splice(index, 1);
        //
        // console.log(this.enteredDirectories)
      }

      this.removeLastDirectoryFromFilePath();
    },
    onDblClick(element) {
      if (element.id !== undefined) {
        this.addDirectoryToFilePath(element.name);
      }

      this.openDirectoryOrFile(element)
    },
    addDirectoryToFilePath(name) {
      if (this.fileSystemPath.length === 0) {
        this.fileSystemPath = `C:\\${name}`;
      } else {
        this.fileSystemPath += `\\${name}`;
      }
    },
    removeLastDirectoryFromFilePath() {
      let fileSystemArray = this.fileSystemPath.split('\\');
      fileSystemArray.splice(fileSystemArray.length - 1, 1);
      this.fileSystemPath = fileSystemArray.join('\\');
    }
  }
}
</script>
<style scoped>
.grid {
  display: flex;
  flex-direction: column;
  align-items: start;
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  width: 100%;
  justify-items: center;
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
  overflow-wrap: break-word;
}

.list-element:hover {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>