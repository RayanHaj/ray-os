<template>
  <DesktopGrid
      @application-name="setApplicationNameVariable"
      :application-names="applicationNames"
      :window-size="windowDimensions"
      class="desktop-grid"/>
</template>

<script>
import DesktopGrid from "@/components/sharedComponents/application-grid";
export default {
  name: "mobile-home",
  components: {DesktopGrid},
  data() {
    return {
      windowDimensions: [],
      applicationNames: ['settings']
    }
  },
  methods: {
    setApplicationNameVariable(name) {
      console.log(name);
    }
  }
}
</script>

<style scoped>
  * {
    background-color: black;
  }
</style>