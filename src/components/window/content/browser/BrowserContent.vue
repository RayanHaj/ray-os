<template>
  <div class="window-content">
    <iframe :src="links[0]" width="98%" height="98%"></iframe>
  </div>
</template>

<script>
export default {
  name: "browser-window",
  props: {
  },
  data() {
    return {
      links: ['http://localhost:8080/']
    }
  }
}
</script>

<style scoped>
  .window-content {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  iframe {
    border: none;
    user-select: none;
    overflow: scroll;
  }
</style>