<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue';
import { fileSystemLookup, insertItemIntoFileSystem } from '@/composables/useIndexedDbHelper.ts';
import type { RayDb } from 'ray-db-wrapper';
import FileExplorerHeader from '@/components/applications/fileExplorer/FileExplorerHeader.vue';
import FileExplorerGrid from '@/components/applications/fileExplorer/FileExplorerGrid.vue';
import type { FileSystemItem, Item } from '@/types/ItemTypes.ts';
import FileExplorerModal from '@/components/applications/fileExplorer/FileExplorerModal.vue';
import { useContextMenuStore } from '@/stores/contextMenu.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { useInjectOrThrow } from '@/composables/useInjectOrThrow.ts';
import { useWindowStore } from '@/stores/window.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const fileSystemStore = useFileSystemStore();

const currentPath = ref<string[]>([fileSystemStore.rootDirectory]);
const currentItems = ref<Array<FileSystemItem & { type: string }>>([]);
const previousItems = ref<Array<Array<FileSystemItem & { type: string }>>>([]);

onBeforeMount(async () => {
  await updateCurrentItems(fileSystemStore.rootDirectory);
});

watch(
  () => fileSystemStore.updateFileSystemVal,
  async () => await updateCurrentItems(currentPath.value.join('/')),
);

async function updateCurrentItems(path: string) {
  const fileSystemItems = await fileSystemLookup(rayDb, path);
  if (!fileSystemItems || !fileSystemItems.children) {
    throw new Error(`No fileSystemItems (children) found with specified path: ${path}`);
  }

  currentItems.value = await mapItemsWithType(fileSystemItems.children);
}

async function mapItemsWithType(items: FileSystemItem[]) {
  return await Promise.all(
    items.map(async (item) => {
      const updatedItems = { ...item, type: 'directory' };

      if (item.file) {
        const file = await rayDb.findOne<Item>('files', 'id', item.file.id);
        updatedItems.type = file.content.type;
      }

      return updatedItems;
    }),
  );
}

function handleBackClick() {
  const poppedItem = previousItems.value.pop();

  if (poppedItem && poppedItem.length > 0) {
    currentItems.value = poppedItem;
    currentPath.value.pop();
  }
}

async function onDblClickItem(item: FileSystemItem & { type: string }) {
  if (item.directory) {
    previousItems.value.push(currentItems.value);
    await updateCurrentItems(`${currentPath.value.join('/')}/${item.directory.name}`);
    currentPath.value.push(item.directory.name);
  } else if (item.file) {
    switch (item.type) {
      case 'application':
        useWindowStore().pushOpenWindowReference(item.file.name);
        break;
      case 'file':
    }
  }
}

const addNewItemModalOpen = ref(false);
function toggleAddNewItemModal() {
  useContextMenuStore().hide();
  addNewItemModalOpen.value = true;
}

async function handleModalInput(input: string) {
  const currentPathItemName = currentPath.value[currentPath.value.length - 1];
  const previousItem = previousItems.value[previousItems.value.length - 1];

  let parentId;
  if (previousItem) {
    parentId = previousItem.find((el) => el.directory?.name === currentPathItemName)?.id ?? null;
  } else {
    parentId = await fileSystemLookup(rayDb, fileSystemStore.rootDirectory).then((value) =>
      value ? value.parent.id : null,
    );
  }

  if (!parentId) {
    return;
  }

  await insertItemIntoFileSystem(rayDb, [parentId], { directory: { name: input, children: [] } });
  addNewItemModalOpen.value = false;
}
</script>

<template>
  <div class="file-explorer">
    <FileExplorerModal
      v-show="addNewItemModalOpen"
      title="add new directory"
      @modal-event:submit-click="handleModalInput"
      @modal-event:cancel-click="addNewItemModalOpen = false"
    />
    <FileExplorerHeader :current-path="currentPath" @header-event:back="handleBackClick" />
    <FileExplorerGrid
      :current-directories="currentItems"
      :previous-directories="previousItems"
      :current-path="currentPath"
      :ray-db="rayDb!"
      @item-event:dbl-click="onDblClickItem"
      @add-new-directory="toggleAddNewItemModal"
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
