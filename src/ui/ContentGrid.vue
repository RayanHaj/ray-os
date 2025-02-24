<template>
  <div class="grid">
    <input type="text" :value="path">
    <div v-if="list.length === 0">
      <p>No {{ name }} found</p>
    </div>
    <ul v-else class="file-list-wrapper">
      <li v-for="element in list" @dblclick="onDblClick(element.id)" :key="element.name"
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
      contentList: []
    }
  },
  mounted() {
    this.contentList = this.list;
    console.log(this.contentList)
  },
  methods: {
    onDblClick(id) {
      console.log(id)
      this.db.getDirectoryById(id).then((directory) => {
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
  align-items: center;
  width: 100%;
  height: 100%;
  margin-left: 0;
  padding-left: 0;
}
ul {
  padding: 0;
}
.file-list-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-template-rows: repeat(auto-fill, minmax(130px, 1fr));
  justify-items: center;
  user-select: none;
  width: 100%;
  height: 100%;
}

.file-thumbnail {
  width: 100px;
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
  width: 140px;
  height: 140px;
}

.list-element:hover {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>