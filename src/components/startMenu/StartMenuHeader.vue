<script setup lang="ts">
import StartMenuTags from '@/components/startMenu/StartMenuTags.vue';
import { useStartMenuStore } from '@/stores/startMenu.ts';
import { ref } from 'vue';

const inputValue = ref<string>('');
async function handleInput() {
  useStartMenuStore().searchQuery = inputValue.value;
}
</script>
<template>
  <div class="start-menu-header">
    <StartMenuTags/>
    <input type="text" placeholder="search" v-model="inputValue" @input="handleInput"/>
  </div>
</template>
<style scoped>
.start-menu-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: auto;
  gap: 10px;
  height: 100px;
  width: 100%;
}

.start-menu-header input {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background: var(--input-primary-color);
  color: var(--text-color);
  border: var(--input-border-color) 1px solid;
  font-size: var(--font-size-elg);
  padding-left: 10px;
}
</style>
