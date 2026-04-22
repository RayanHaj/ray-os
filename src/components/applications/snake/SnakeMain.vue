<script setup lang="ts">
import { computed, type ComputedRef, ref } from 'vue';

type GridSize = (typeof gridSizes)[number];
const gridSizes = ['small', 'medium', 'large', 'huge'] as const;
const selectGridSize = ref<GridSize>('medium');

const gridSizeValues: ComputedRef<{ x: number; y: number }> = computed(() => {
  switch (selectGridSize.value) {
    case 'small':
      return { x: 15, y: 15 };
    case 'medium':
      return { x: 20, y: 20 };
    case 'large':
      return { x: 30, y: 30 };
    case 'huge':
      return { x: 50, y: 50 };
    default:
      return { x: 20, y: 20 };
  }
});


</script>
<template>
  <div class="snake">
    <div class="main-menu">
      <select name="grid-sizes" class="grid-size-selection">
        <option
          v-for="size in gridSizes"
          :key="size"
          :value="selectGridSize"
          :selected="size === 'medium'"
        >
          {{ size }}
        </option>
      </select>
      <button>Start</button>
    </div>
    <div class="game">
      <div class="grid">
        <div v-for="x in gridSizeValues.x" :key="x">
          <div v-for="y in gridSizeValues.y" :key="y">
            d
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.snake {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.main-menu {
  display: flex;
  justify-content: center;
  align-items: center;
}
.grid {
  display: grid;
  justify-content: center;
  align-items: center;
}
</style>
