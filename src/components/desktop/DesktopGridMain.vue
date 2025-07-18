<script setup lang="ts">
import DesktopGridTile from '@/components/desktop/DesktopGridTile.vue';
import { useTileCountGrid } from '@/composables/desktop/useTileCountGrid.ts';
import { useBrowserStore } from '@/stores/browser.ts';
import { useContextMenuStore } from '@/stores/contextMenu.ts';

function onGridRightClick(event: MouseEvent) {
  useContextMenuStore().initializeContextMenu(
    ['Copy', 'Paste'],
    [
      { id: 'test', label: 'this is a test', disabled: false },
      { id: 'properties', label: 'open properties', disabled: false },
    ],
    { left: event.clientX, top: event.clientY },
    { Copy: () => {} },
  );

  useContextMenuStore().show();
}
</script>

<template>
  <div
    class="grid"
    @dragover.prevent
    @dragenter.prevent
    @click.right.prevent="onGridRightClick"
    :style="{ height: `${useBrowserStore().heightExcTaskbar}px` }"
  >
    <div class="row" v-for="row in useTileCountGrid().x.value" :key="row">
      <DesktopGridTile
        v-for="column in useTileCountGrid().y.value"
        :key="column"
        :tile-position="{ x: row, y: column }"
      />
    </div>
  </div>
</template>

<style scoped>
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
