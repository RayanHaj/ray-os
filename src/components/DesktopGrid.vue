<script setup lang="ts">
import TileComponent from '@/components/DesktopGridTile.vue'
import { useTileCountGrid } from '@/composables/useTileCountGrid.ts'
import { computed } from 'vue'
import { useBrowserStore } from '@/stores/browser.ts'
import { useTaskbarStore } from '@/stores/taskbar.ts'
import { useGridStore } from '@/stores/grid.ts'
import type { Tile } from '@/types/Tile.ts'

const gridStore = useGridStore();
const browserStore = useBrowserStore();
const taskbarStore = useTaskbarStore();
const tileCountHorizontal = useTileCountGrid().x;
const tileCountVertical = useTileCountGrid().y;
const gridHeight = computed(() => (browserStore.height - taskbarStore.taskbarHeight) - 1);

function onDrop(event: DragEvent) {
  const targetId = Number((event.currentTarget as HTMLElement).id);
  const sourceJSONString = event.dataTransfer?.getData('application/json');

  let source: Tile | null = null;
  if (sourceJSONString) {
    try {
      source = JSON.parse(sourceJSONString);
    } catch (e) {
      console.error(e);
      return;
    }
  }

  if (source === null) return;

  const sourceIndex = gridStore.tiles.findIndex(tile => tile.content.id === source?.content.id);
  if (sourceIndex !== -1) {
    gridStore.tiles.splice(sourceIndex, 1);
  }

  const targetIndex = gridStore.tiles.findIndex(tile => tile.content.id === targetId);
  if (targetIndex === -1) {
    source.content.id = targetId;
    gridStore.tiles.push(source);
  } else {
    return;
  }
}
</script>

<template>
  <div
    class="container"
    :style="{ height: `${gridHeight}px` }"
  >
    <div class="grid" @dragover.prevent>
      <div class="column" v-for="row in tileCountHorizontal" :key="row">
        <div class="row" v-for="column in tileCountVertical" :key="column">
          <TileComponent :position="{x: row, y: column}" @drop.prevent="onDrop"/>
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
}

.column {
  display: flex;
  flex-direction: column;
}
</style>
