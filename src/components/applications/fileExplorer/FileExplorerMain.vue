<script setup lang="ts">
import {
  type ComponentPublicInstance,
  inject,
  onBeforeMount,
  reactive,
  ref,
  watch
} from 'vue';
import {
  fileSystemLookup,
  fileSystemLookupChildren,
  insertItemIntoFileSystem,
} from '@/composables/useIndexedDbHelper.ts';
import type { RayDb } from 'ray-db-wrapper';
import FileExplorerHeader from '@/components/applications/fileExplorer/FileExplorerHeader.vue';
import FileExplorerGrid from '@/components/applications/fileExplorer/FileExplorerGrid.vue';
import type { FileSystemItem } from '@/types/FileSystemItem.ts';
import FileExplorerModal from '@/components/applications/fileExplorer/FileExplorerModal.vue';
import { useContextMenuStore } from '@/stores/contextMenu.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';

const rayDb = inject<RayDb>('rayDb');
const fileExplorerGrid = ref<
  | ComponentPublicInstance<{
      onDblClickItem: () => void;
    }>
  | undefined
>();

const currentPath = ref<string[]>([useFileSystemStore().rootDirectory]);
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

  currentDirectories.value = (await fileSystemLookupChildren(rayDb, useFileSystemStore().rootDirectory))?.children ?? [];
});

watch(
  () => useFileSystemStore().updateFileSystemVal,
  async () => {
    if (!rayDb) {
      return;
    }

    currentDirectories.value =
      (await fileSystemLookupChildren(rayDb, currentPath.value.join('/')))?.children ??
      [];
  },
);

function handleHeaderEvent(event: string) {
  switch (event) {
    case 'back':
      const poppedDirectory = previousDirectories.value.pop();
      if (!Array.isArray(poppedDirectory)) {
        return;
      }
      if (poppedDirectory.length > 0) {
        currentDirectories.value = poppedDirectory;
        currentPath.value.pop();
      }
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

  if (fileSystemItem.directory) {
    const children = await fileSystemLookupChildren(rayDb, `${currentPath.value.join('/')}/${fileSystemItem.directory.name}`)
      .then(value => value?.children);
    previousDirectories.value.push(currentDirectories.value);

    currentDirectories.value = children ?? [];

    if (fileSystemItem.directory && fileSystemItem.directory.name) {
      currentPath.value.push(fileSystemItem.directory.name);
    }
  }
}

const showNewDirectoryModal = ref(false);

function toggleModal() {
  useContextMenuStore().hide();
  showNewDirectoryModal.value = true;
}

async function handleModalInput(input: string) {
  if (!rayDb) {
    showNewDirectoryModal.value = false;
    return;
  }

  const parentName = currentPath.value[currentPath.value.length - 1];
  const previous = previousDirectories.value[previousDirectories.value.length - 1];

  let parentId = null;
  if (previous) {
    parentId = previous.find((el) => el.directory?.name === parentName)?.id ?? null;
  } else {
    parentId = await fileSystemLookup(rayDb, useFileSystemStore().rootDirectory).then((value) => (value ? value[0].id : null));
  }

  if (!parentId) {
    return;
  }

  await insertItemIntoFileSystem(rayDb, [parentId], {
    directory: { name: input, children: [] },
  });

  showNewDirectoryModal.value = false;
}
</script>

<template>
  <div class="file-explorer">
    <FileExplorerModal
      v-show="showNewDirectoryModal"
      title="add new directory"
      @modal-event:submit-click="handleModalInput"
      @modal-event:cancel-click="showNewDirectoryModal = false"
    />
    <FileExplorerHeader :current-path="currentPath" @header-event="handleHeaderEvent" />
    <FileExplorerGrid
      ref="fileExplorerGrid"
      :current-directories="currentDirectories"
      :previous-directories="previousDirectories"
      :ray-db="rayDb!"
      :header-events="headerEvents"
      @item-event:dbl-click="onDblClickItem"
      @add-new-directory="toggleModal"
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
