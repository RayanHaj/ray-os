<script setup lang="ts">
import { type ComponentPublicInstance, inject, onBeforeMount, reactive, ref } from 'vue';
import { fileSystemLookupChildren } from '@/composables/useIndexedDbHelper.ts';
import type { RayDb } from 'ray-db-wrapper';
import FileExplorerHeader from '@/components/applications/fileExplorer/FileExplorerHeader.vue';
import FileExplorerGrid from '@/components/applications/fileExplorer/FileExplorerGrid.vue';
import type { FileSystemItem } from '@/types/FileSystemItem.ts';

const rayDb = inject<RayDb>('rayDb');
const fileExplorerGrid = ref<ComponentPublicInstance<{
  onDblClickItem: () => void
}> | undefined>();

const currentPath = ref<string[]>(['C:']);
const currentDirectories = ref<FileSystemItem[]>([]);
const previousDirectories = ref<FileSystemItem[][]>([]);

const headerEvents = reactive({
  zoomIn: 0,
  zoomOut: 0,
  back: 0,
});
onBeforeMount(async () => {
  if (!rayDb) {
    return;
  }

  currentDirectories.value = (await fileSystemLookupChildren(rayDb, 'C:')) ?? [];
});

function handleHeaderEvent(event: string) {
    switch (event) {
      case 'back':
        headerEvents.back += 1;
        break;
      case 'zoomOut':
        headerEvents.zoomOut += 1;
        break;
      case 'zoomIn':
        headerEvents.zoomIn += 1;
    }
}

async function onDblClickItem(fileSystemItem: FileSystemItem) {
  if (!rayDb) {
    return;
  }

  previousDirectories.value.push(currentDirectories.value);

  if (fileSystemItem.directory) {
    const children = await fileSystemLookupChildren(rayDb, fileSystemItem.directory.name);
    currentDirectories.value = children ?? currentDirectories.value;

    if (fileSystemItem.directory && fileSystemItem.directory.name && children) {
      currentPath.value.push(fileSystemItem.directory.name);
    }
  }
}
</script>

<template>
  <div class="file-explorer">
    <FileExplorerHeader
      :current-path="currentPath"
      @header-event="handleHeaderEvent"
    />
    <FileExplorerGrid
      ref="fileExplorerGrid"
      :current-directories="currentDirectories"
      :previous-directories="previousDirectories"
      :ray-db="rayDb!"
      :header-events="headerEvents"
      @item-event:dbl-click="onDblClickItem"
      @item-event:right-click="console.log('right clicked', $event)"
    />
  </div>
</template>

<style scoped>
.file-explorer {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100% - 30px);
  overflow: auto;
}
</style>
