<script setup lang="ts">
import StartMenuTags from '@/components/startMenu/StartMenuTags.vue';
</script>
<template>
  <div class="start-menu-header">
    <StartMenuTags/>
    <input type="text" placeholder="search" />
  </div>
</template>
<style scoped>
.start-menu-header {
  top: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  margin: auto;
  left: 50%;
  gap: 10px;
  transform: translateX(-50%);
  height: 100px;
  width: 97%;
}

.start-menu-header input {
  width: 98%;
  height: 90%;
  border-radius: 12px;
  background: var(--input-primary-color);
  color: var(--text-color);
  border: var(--input-border-color) 1px solid;
  font-size: var(--font-size-elg);
  padding-left: 10px;
}
</style>
