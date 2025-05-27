<script setup lang="ts">
import type { FileSystemItem } from '@/types/FileSystemItem.ts';
import {
  type Component,
  onBeforeMount,
  type PropType, ref,
  shallowRef, watch
} from 'vue';
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useContextMenuStore } from '@/stores/contextMenu.ts';

const props = defineProps({
  currentDirectories: {
    required: true,
    type: Array as PropType<FileSystemItem[]>,
  },
  previousDirectories: {
    required: true,
    type: Array as PropType<FileSystemItem[][]>,
  },
  rayDb: {
    required: true,
    type: Object as PropType<RayDb>,
  },
  headerEvents: {
    required: true,
    type: Object as PropType<{
      zoomIn: number;
      zoomOut: number;
      back: number;
    }>,
  },
});

const emits = defineEmits(['itemEvent:dblClick', 'itemEvent:rightClick']);

watch(() => props.headerEvents.back, () => {

});
watch(() => props.headerEvents.zoomIn, () => {
  console.log('zoom in')
});
watch(() => props.headerEvents.zoomOut, () => {
  console.log('zoom out')
});

const directorySvg = shallowRef<Component | undefined>();
const contextMenuStore = useContextMenuStore();
onBeforeMount(async () => {
  directorySvg.value = (await useSvgByFileNameAndDirectory('ui', 'Directory')) ?? undefined;
});

function onRightClick(event: MouseEvent) {
  contextMenuStore.initializeContextMenu(
    ['Copy', 'Paste', 'Delete'],
    [
      { id: 'test', label: 'this is a test', disabled: false },
      { id: 'properties', label: 'open properties', disabled: false}
    ],
    { left: event.clientX, top: event.clientY }
  );

  contextMenuStore.show();
}
</script>

<template>
  <section class="file-explorer-grid" ref="gridRef"
           @click.right.prevent="onRightClick"
  >
    <div class="grid">
      <div
        class="item"
        v-for="fileSystemItem of currentDirectories"
        :key="fileSystemItem.id"
        @dblclick="emits('itemEvent:dblClick', fileSystemItem)"
        @click.right="emits('itemEvent:rightClick', fileSystemItem)"
      >
        <component
          :is="directorySvg"
          :custom-width="60"
          :custom-height="60"
          :style="{ marginLeft: '5px' }"
        />
        {{ fileSystemItem.directory?.name }}
      </div>
    </div>
  </section>
</template>

<style scoped>
.file-explorer-grid {
  position: relative;
  height: calc(100% - 50px);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-left: 0;
  padding-left: 0;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  user-select: none;
  padding: 10px;
}

.item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
  color: var(--text-color);
  padding: 10px;
}

.item:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>
