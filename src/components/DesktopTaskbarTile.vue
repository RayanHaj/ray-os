<script setup lang="ts">
  import { useFileStore } from '@/stores/file.ts';
  import { useTaskbarStore } from '@/stores/taskbar.ts'
  import { type Component, onBeforeMount, ref } from 'vue'
  import type { Item } from '@/types/Item.ts'

  const fileStore = useFileStore();
  const taskbarStore = useTaskbarStore();
  const props = defineProps({
    id: {
      required: true,
      type: Number
    }
  });

  const item = ref<Item>();
  const svg = ref<Component>();
  onBeforeMount(() => {
    updateTile();
  });

  function updateTile() {
    item.value = taskbarStore.items.find((item) => item.content.id === props.id);

    if (item.value && item.value.content.type === 'application' && item.value.label !== '') {
      svg.value = fileStore.fileSvgs[item.value.label];
    }
  }
</script>

<template>
  <div class="tile">
    <div class="content">
      <component v-if="svg" :is="svg"
                 :custom-width="40"
                 :custom-height="40"
      />
      <hr :style="{visibility: 'visible'}">
    </div>
  </div>
</template>

<style scoped>
  .tile {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 10px;
    position: relative;
  }

  .tile:hover {
    background-color: var(--button-hover-color);
    border-radius: 10px;
  }

  hr {
    height: 5px;
    border: none;
    background-color: var(--svg-color);
    border-radius: 50px;
    bottom: 0;
    width: 66%;
    position: absolute;
  }

  .content {
    display: flex;
    flex-direction: column;
  }
</style>
