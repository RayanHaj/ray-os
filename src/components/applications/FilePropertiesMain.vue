<script setup lang="ts">
import { ref, watch } from 'vue';
import { type FileProperties, useFilePropertiesStore } from '@/stores/fileProperties.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';

const windowId = useInjectOrThrow<string>('windowId');

const filePropertiesStore = useFilePropertiesStore();

type LocalFileProperties = Omit<FileProperties, 'windowId'>;
const fileProperties = ref<LocalFileProperties>();
watch(
  () => filePropertiesStore.loadedFileProperties,
  (newProperties) => {
    if (newProperties?.windowId !== windowId) return;
    fileProperties.value = newProperties;
  },
  { immediate: true },
);
</script>
<template>
  <div class="file-properties">
    <p>{{ fileProperties?.name }}</p>
    <p>{{ fileProperties?.type }}</p>
    <p>{{ fileProperties?.location }}</p>
  </div>
</template>
<style scoped>
  p {
    color: var(--text-color);
  }
</style>
