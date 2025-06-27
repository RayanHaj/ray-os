<script setup lang="ts">
import GridTile from '@/components/GridTile.vue';
import { useTileCountGrid } from '@/composables/useTileCountGrid.ts';
import { computed } from 'vue';
import { useBrowserStore } from '@/stores/browser.ts';
import { useTaskbarStore } from '@/stores/taskbar.ts';
import { useContextMenuStore } from '@/stores/contextMenu.ts';

const browserStore = useBrowserStore();
const taskbarStore = useTaskbarStore();
const tileCountHorizontal = useTileCountGrid().x;
const tileCountVertical = useTileCountGrid().y;
const gridHeight = computed(() => browserStore.height - taskbarStore.taskbarHeight - 1);

const contextMenuStore = useContextMenuStore();
function onRightClick(event: MouseEvent) {
  contextMenuStore.initializeContextMenu(
    ['Copy', 'Paste'],
    [
      { id: 'test', label: 'this is a test', disabled: false },
      { id: 'properties', label: 'open properties', disabled: false },
    ],
    { left: event.clientX, top: event.clientY },
    { Copy: () => {} },
  );

  contextMenuStore.show();
}
</script>

<template>
  <div class="container" :style="{ height: `${gridHeight}px` }">
    <div class="grid" @dragover.prevent @dragenter.prevent @click.right.prevent="onRightClick">
      <div class="row" v-for="row in tileCountHorizontal" :key="row">
        <div class="column" v-for="column in tileCountVertical" :key="column">
          <GridTile :position="{ x: row, y: column }" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.grid {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.row {
  display: flex;
  flex-direction: column;
}
</style>
