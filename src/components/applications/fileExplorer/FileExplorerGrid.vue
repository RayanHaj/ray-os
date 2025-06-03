<script setup lang="ts">
import type { FileSystemItem } from '@/types/FileSystemItem.ts';
import { type Component, onBeforeMount, type PropType, shallowRef } from 'vue';
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useContextMenuStore } from '@/stores/contextMenu.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import type { SecondaryActionsContextMenu } from '@/types/SecondaryActionsContextMenu.ts';
import type { PrimaryActionsContextMenu } from '@/types/PrimaryActionsContextMenu.ts';
import { useFileStore } from '@/stores/file.ts';

const props = defineProps({
  currentDirectories: {
    required: true,
    type: Array as PropType<Array<FileSystemItem & { type: string }>>
  },
  previousDirectories: {
    required: true,
    type: Array as PropType<FileSystemItem[][]>
  },
  rayDb: {
    required: true,
    type: Object as PropType<RayDb>
  }
});

const emits = defineEmits(['itemEvent:dblClick', 'addNewDirectory']);

const directorySvg = shallowRef<Component | undefined>();
const fileSvg = shallowRef<Component | undefined>();

const contextMenuStore = useContextMenuStore();
onBeforeMount(async () => {
  directorySvg.value = (await useSvgByFileNameAndDirectory('ui', 'Directory')) ?? undefined;
  fileSvg.value = (await useSvgByFileNameAndDirectory('ui', 'TextFile')) ?? undefined;
});

const primaryActionsGrid: PrimaryActionsContextMenu[] = [];
const secondaryActionsGrid: SecondaryActionsContextMenu[] = [
  { id: 'newDirectory', label: 'add new directory', disabled: false }
];
const actionsGrid = () => {
  return {
    newDirectory: async () => {
      emits('addNewDirectory');
    }
  };
};

const primaryActionsGridItem: PrimaryActionsContextMenu[] = ['Copy', 'Paste', 'Delete'];
const secondaryActionsGridItem: SecondaryActionsContextMenu[] = [];
const actionsGridItem = (file: FileSystemItem | null) => {
  return {
    Copy: async () => {},
    Delete: async () => {
      if (!file) {
        return;
      }

      if (file?.id && file.directory) {
        await props.rayDb?.deleteOne('fileSystem', file.id);
      }

      useFileSystemStore().updateFileSystem();
      useContextMenuStore().hide();
    }
  };
};

function onRightClick(
  event: MouseEvent,
  file: FileSystemItem | null,
  calledFrom: 'grid' | 'gridItem'
) {
  contextMenuStore.initializeContextMenu(
    calledFrom === 'grid' ? primaryActionsGrid : primaryActionsGridItem,
    calledFrom === 'grid' ? secondaryActionsGrid : secondaryActionsGridItem,
    { left: event.clientX, top: event.clientY },
    calledFrom === 'grid' ? actionsGrid() : actionsGridItem(file)
  );
  contextMenuStore.show();
}

function getSvg(fileSystemItem: FileSystemItem & { type: string }) {
  switch (fileSystemItem.type) {
    case 'application': {
      if (!fileSystemItem.file?.name) {
        return fileSvg.value;
      }
      return useFileStore().fileSvgs[fileSystemItem.file?.name];
    }
    case 'file': {
      return fileSvg.value;
    }
    case 'directory': {
      return directorySvg.value;
    }
    default: {
      return fileSvg.value;
    }
  }
}
</script>

<template>
  <section
    class="file-explorer-grid"
    ref="gridRef"
    @click.right.prevent.stop="onRightClick($event, null, 'grid')"
  >
    <div class="grid">
      <div
        class="item"
        v-for="fileSystemItem of currentDirectories"
        :key="fileSystemItem.id"
        @dblclick="emits('itemEvent:dblClick', fileSystemItem)"
        @click.right.prevent.stop="onRightClick($event, fileSystemItem, 'gridItem')"
      >
        <component
          :is="getSvg(fileSystemItem)"
          :custom-width="60"
          :custom-height="60"
          :style="{ marginLeft: '5px' }"
        />
        {{ fileSystemItem.directory?.name ?? fileSystemItem.file?.name }}
      </div>
    </div>
  </section>
</template>

<style scoped>
.file-explorer-grid {
  position: relative;
  height: calc(100% - 50px);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-left: 0;
  padding-left: 0;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  user-select: none;
  padding: 10px;
}

.item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
  align-items: center;
  width: 100px;
  color: var(--text-color);
  padding: 10px;
  font-size: 12px;
}

.item:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>
