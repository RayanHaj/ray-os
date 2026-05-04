<script setup lang="ts">
const { audioFile } = defineProps<{ audioFile: File }>();
</script>
<template>
  <div class="audio-player-list-item">
    {{ audioFile.name }}
  </div>
</template>

<style scoped></style>
