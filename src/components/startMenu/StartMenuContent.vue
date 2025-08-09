<script setup lang="ts">
import { useStartMenuStore } from '@/stores/startMenu.ts';
import { ref, watch } from 'vue';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { useWindowStore } from '@/stores/window.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const contentList = ref<string[]>([]);
watch(
  () => useStartMenuStore().searchQuery,
  async (newValue, oldValue) => {
    if (newValue !== oldValue) {
      contentList.value = await useStartMenuStore().fetchContentByTagAndSearchQuery(
        rayDb,
        newValue,
      );
    }
  },
);

function handleClick(content: string) {
  useWindowStore().pushOpenWindowReference(content);
  useStartMenuStore().hide();
}
</script>
<template>
  <div class="start-menu-content">
    <div v-for="content in contentList" :key="content" class="content" @click="handleClick(content)">
      <component
        v-if="useSvgOrFallback(content).found"
        :is="useSvgOrFallback(content).svg"
        :custom-width="20"
        :custom-height="20"
      />
      {{ content }}
    </div>
  </div>
</template>
<style scoped>
.start-menu-content {
  padding: 5px;
  color: var(--text-color);
  width: 100%;
}

.content {
  display: flex;
  align-items: center;
  padding: 10px;
  gap: 5px;
  width: 100%;
  cursor: default;
}

.content:hover {
  background-color: var(--tabs-hover);
  border-radius: 10px;
}
</style>
