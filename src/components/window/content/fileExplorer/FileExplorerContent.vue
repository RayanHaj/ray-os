<template>
  <div class="content">
    <content-grid :list="list" :name="currentDirectory"/>
  </div>
</template>
<script>
import ContentGrid from "@/ui/ContentGrid";
import {useGlobalState} from "@/stores/globalState";
import config from "@/assets/json/config"
export default {
  name: "file-explorer-window",
  components: {ContentGrid},
  inject: ['db'],
  data() {
    return {
      list: [],
      currentDirectory: config.rootDirectory
    }
  },
  computed: {
    globalState() {
      return useGlobalState();
    },
  },

  mounted() {
    this.db.getDirectoriesByNameFileSystem(this.currentDirectory).then(elements => {
      elements[0].children.forEach(child => {
          this.list.push(child)
      })
    });
  },

  methods: {
    playAudio() {
    }
  }
}
</script>
<style>

</style>