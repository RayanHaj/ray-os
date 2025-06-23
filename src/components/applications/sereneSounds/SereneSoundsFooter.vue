<script setup lang="ts">

import SereneSoundsPlayingSound
  from '@/components/applications/sereneSounds/SereneSoundsPlayingSound.vue';
</script>

<template>
  <div class="serene-sounds-footer">
    <SereneSoundsPlayingSound/>
  </div>
</template>

<style scoped>
  .serene-sounds-footer {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--taskbar-background-color);
    width: 100%;
    height: 50px;
  }
</style>
