<script setup lang="ts">
import { ref, watch } from 'vue';
import { type FileProperties, useFilePropertiesStore } from '@/stores/fileProperties.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { useGetSvgByFileProperties } from '@/composables/fileExplorer/useGetSvgByFileProperties.ts';
import FilePropertiesItem from '@/components/applications/FilePropertiesItem.vue';

const windowId = useInjectOrThrow<string>('windowId');

const filePropertiesStore = useFilePropertiesStore();

const fileProperties = ref<FileProperties>();
watch(
  () => filePropertiesStore.loadedFileProperties,
  (newProperties) => {
    if (newProperties?.windowId !== windowId) return;
    fileProperties.value = newProperties;
  },
  { immediate: true },
);

const filePropertiesItemValues: { title: string; value: string }[] = [
  { title: 'type', value: fileProperties.value?.type ?? '' },
  { title: 'location', value: fileProperties.value?.location ?? '' },
];
</script>
<template>
  <div class="file-properties">
    <div class="top-section">
      <div class="file-icon">
        <component v-if="fileProperties" :is="useGetSvgByFileProperties(fileProperties)" />
      </div>
      <p>{{ fileProperties?.name }}</p>
    </div>
    <hr />
    <div class="file-properties-list">
      <FilePropertiesItem
        v-for="filePropertiesItemValue in filePropertiesItemValues"
        :key="filePropertiesItemValue.title"
        :title="filePropertiesItemValue.title"
        :value="filePropertiesItemValue.value"
      />
    </div>
  </div>
</template>
<style scoped>
.file-properties {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.top-section {
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 20px;
  padding-inline: 10px;
  padding-block: 5px;
}
.top-section p {
  align-self: center;
  font-size: var(--font-size-sm);
  font-weight: bolder;
}
.file-icon {
  display: flex;
  justify-content: center;
  align-items: center;
}
.top-section svg {
  width: 30px;
  height: 30px;
}
hr {
  width: 100%;
  border: var(--window-border-color) solid 1px;
  border-radius: 5px;
}
.file-properties-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-inline: 10px;
  padding-block: 5px;
}
</style>
