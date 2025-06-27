<script setup lang="ts">
import type { PropType } from 'vue';

defineProps({
  currentPath: { required: false, type: Array as PropType<string[]>, default: () => ['C:/'] },
});
const emits = defineEmits(['header-event:back']);
</script>

<template>
  <header class="file-explorer-header">
    <div class="left-side">
      <button class="back-button" @click="emits('header-event:back')">^</button>
    </div>
    <div class="middle-side">
      <input type="text" :value="currentPath.join('/')" disabled />
    </div>
  </header>
</template>

<style scoped>
.file-explorer-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 50px;
  color: var(--text-color);
}

.left-side,
.back-button {
  width: 150px;
}

.middle-side {
  width: 100%;
}

button {
  background: var(--button-primary-color);
  border: var(--window-border-color) 1px solid;
  width: 100%;
  height: 50px;
  color: var(--text-color);
}

input {
  border-radius: unset;
  border: var(--window-border-color) 1px solid;
  background: var(--input-primary-color);
  width: 100%;
  height: 100%;
  color: var(--text-color);
}
</style>
