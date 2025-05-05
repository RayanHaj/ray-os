<script setup lang="ts">
  import { useFileStore } from '@/stores/file.ts';
  import { useTaskbarStore } from '@/stores/taskbar.ts'
  import { useWindowStore } from '@/stores/window.ts'
  import { type Component, computed, onBeforeMount, ref } from 'vue'
  import type { Item } from '@/types/Item.ts'
  import DesktopTaskbarTabs from '@/components/DesktopTaskbarTabs.vue'

  const fileStore = useFileStore();
  const taskbarStore = useTaskbarStore();
  const props = defineProps({
    id: {
      required: true,
      type: Number
    }
  });

  const isHoveringOnTile = ref(false);

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

  const windowStore = useWindowStore();
  const getUnderlineClass = computed(() => {
    if (!item.value) {
      return 'underline hidden';
    }

    if (!windowStore.openWindowsReferences[item.value.label]) {
      return 'underline hidden';
    }

    const openWindowsReferenceCount = windowStore.openWindowsReferences[item.value.label].length;
    const minimizedCount = windowStore.openWindowsReferences[item.value.label]
      .reduce((accumulator, value) => value.minimized ? accumulator + 1 : accumulator, 0);

    if (minimizedCount === openWindowsReferenceCount) {
      return 'underline minimized';
    } else {
      return 'underline maximized';
    }
  });

  function hasTabs() {
    if (!isHoveringOnTile.value) {
      return false;
    }

    const reference = windowStore.openWindowsReferences[item.value ? item.value.label : ''];
    if (!reference || reference.length === 0) {
      return false;
    }

    return true;
  }
</script>

<template>
  <div class="tile"
       @mouseenter.prevent="isHoveringOnTile = true"
       @mouseleave.prevent="isHoveringOnTile = false"
  >
    <DesktopTaskbarTabs v-if="hasTabs() && item" :application-name="item.label"/>
    <div class="content">
      <component v-if="svg" :is="svg"
                 :custom-width="40"
                 :custom-height="40"
      />
      <hr :class="getUnderlineClass">
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
    bottom: 2px;
    width: 66%;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .content {
    display: flex;
    flex-direction: column;
  }

  .underline.hidden {
    visibility: hidden;
  }

  .underline.maximized {
    width: 66%;
  }

  .underline.minimized {
    width: 40%;
  }
</style>
