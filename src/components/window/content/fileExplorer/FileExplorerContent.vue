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
    const rootDirectory = {
      id: 1,
      type: 'directory',
      name: 'My Files'
    }

    this.list.push(rootDirectory);
  },

  methods: {
    playAudio() {
    }
  }
}
</script>
<style>

</style>