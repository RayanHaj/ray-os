<template>
  <div class="grid">
    <div class="page-header">
      <input class="file-search-field" type="text" :value="path">
      <div class="zoom-buttons">
        <button class="zoom-in"
                @click="zoomValue = zoomValue !== maximumZoomValue ? zoomValue += 10 : zoomValue">
          in
        </button>
        <button class="zoom-out"
                @click="zoomValue = zoomValue !== minimalZoomValue ? zoomValue -= 10 : zoomValue">
          out
        </button>
      </div>
    </div>
    <div v-if="list.length === 0">
      <p>No {{ name }} found</p>
    </div>
    <ul v-else class="file-list-wrapper">
      <li v-for="element in contentList"
          @dblclick="onDblClick(element.id)"
          :key="element.name"
          :style="{
            width: `${zoomValue}px`,
            height: `${zoomValue}px`
          }"
          class="list-element">
        <video v-if="element.type === 'video/mp4'" :src="element.videoUrl" :id="element" class="file-thumbnail"/>
        <img v-else src="../assets/images/applicationImages/file-explorer.png" class="file-thumbnail" :alt="`${name}-thumbnail`">
        <div class="file-name">
          {{ element.name.length > 70 ? `${element.name.substring(0, 70)}...` : element.name }}
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'ContentGrid',
  inject: ['db'],
  props: {
    path: {
      default: 'My Files/',
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
  data() {
    return {
      contentList: [],
      zoomValue: 150,
      minimalZoomValue: 100,
      maximumZoomValue: 150
    }
  },
  mounted() {
    this.db.getAllElements('files').then(files => console.log(files.find(file => file.name === 'Calculator')))
    this.contentList = this.list;
    console.log(this.contentList)
  },
  methods: {
    onDblClick(id) {
      this.db.getDirectoryById(id).then((directory) => {
        console.log(directory)
        if (directory.children.length === 0) {
          return;
        }

        this.contentList = [];
        directory.children.forEach(child => {
          this.contentList.push(child)
        })
      })
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
  width: 80%;
}
.zoom-buttons {
  width: 20%;
}
.zoom-in, .zoom-out {
  width: 50%;
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