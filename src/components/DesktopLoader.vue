<template>
  <div class="os-loader-container">
    <video class="os-loader" autoplay muted @ended="$emit('finished')">
      <source src="@/assets/videos/os_loader.mp4">
    </video>
  </div>
</template>

<script>
export default {
  name: "os-loader"
}
</script>

<style scoped>
.os-loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  height: 100%;
  width: 100%;
  background-color: black;
}

.os-loader {
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>