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
    const defaultDirectory = {
      id: 1,
      type: 'directory',
      name: 'My Files'
    }

    this.list.push(defaultDirectory);
  },

  methods: {
    playAudio() {
    }
  }
}
</script>
<style>
  .content {
    width: 100%;
    height: 100%;
  }
  content-grid {
    width: 100%;
    height: 100%;
  }
</style>