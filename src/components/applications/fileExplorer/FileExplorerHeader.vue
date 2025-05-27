<script setup lang="ts">
  import type { PropType } from 'vue';

  defineProps({
    currentPath: {
      required: false,
      type: Array as PropType<string[]>,
      default: () => ['C:/']
    }
  });
  const emits = defineEmits(['headerEvent']);
</script>

<template>
  <header class="file-explorer-header">
    <div class="left-side">
      <button @click="emits('headerEvent', 'back')">^</button>
    </div>
    <div class="middle-side">
      <input type="text" :value="currentPath.join('/')" disabled>
    </div>
    <div class="right-side">
      <button @click="emits('headerEvent', 'zoomIn')">In</button>
      <button @click="emits('headerEvent', 'zoomOut')">Out</button>
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

  .left-side {
    width: 15%;
  }

  .right-side {
    width: 15%;
  }

  .middle-side {
    width: 70%;
  }

  .right-side {
    display: flex;
    flex-direction: row;
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
