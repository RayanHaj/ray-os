<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useBrowserStore } from '@/stores/browser.ts'
import { onBeforeMount, onUnmounted } from 'vue'

const browserStore = useBrowserStore();
onBeforeMount(() => {
  browserStore.startListening();
});
onUnmounted(() => {
  browserStore.stopListening();
});
</script>

<template>
  <RouterView />
</template>

<style scoped>
</style>
