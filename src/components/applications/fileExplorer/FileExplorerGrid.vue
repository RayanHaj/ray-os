<script setup lang="ts">
import type { FileSystemItem } from '@/types/FileSystemItem.ts';
import { type Component, onBeforeMount, type PropType, shallowRef, watch } from 'vue';
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useContextMenuStore } from '@/stores/contextMenu.ts';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import { fileSystemLookup, insertItemIntoFileSystem } from '@/composables/useIndexedDbHelper.ts';
import type { SecondaryActionsContextMenu } from '@/types/SecondaryActionsContextMenu.ts';
import type { PrimaryActionsContextMenu } from '@/types/PrimaryActionsContextMenu.ts';

const props = defineProps({
  currentDirectories: {
    required: true,
    type: Array as PropType<FileSystemItem[]>,
  },
  previousDirectories: {
    required: true,
    type: Array as PropType<FileSystemItem[][]>,
  },
  rayDb: {
    required: true,
    type: Object as PropType<RayDb>,
  },
  headerEvents: {
    required: true,
    type: Object as PropType<{
      zoomIn: number;
      zoomOut: number;
      back: number;
    }>,
  },
});

const emits = defineEmits(['itemEvent:dblClick', 'addNewDirectory']);
watch(
  () => props.headerEvents.back,
  () => {},
);
watch(
  () => props.headerEvents.zoomIn,
  () => {},
);
watch(
  () => props.headerEvents.zoomOut,
  () => {},
);

const directorySvg = shallowRef<Component | undefined>();
const contextMenuStore = useContextMenuStore();
onBeforeMount(async () => {
  directorySvg.value = (await useSvgByFileNameAndDirectory('ui', 'Directory')) ?? undefined;
});

const primaryActionsGrid: PrimaryActionsContextMenu[] = [];
const secondaryActionsGrid: SecondaryActionsContextMenu[] = [
  { id: 'newDirectory', label: 'add new directory', disabled: false },
];
const actionsGrid = () => {
  return {
    newDirectory: async () => {
      emits('addNewDirectory');
    },
  };
};

const primaryActionsGridItem: PrimaryActionsContextMenu[] = ['Copy', 'Paste', 'Delete'];
const secondaryActionsGridItem: SecondaryActionsContextMenu[] = [];
const actionsGridItem = (file: FileSystemItem | null) => {
  return {
    Copy: async () => {
      const parentId = await fileSystemLookup(props.rayDb, 'applications').then((value) =>
        value ? value[0].id : undefined,
      );
      if (parentId) {
        await insertItemIntoFileSystem(props.rayDb, [parentId], {
          directory: { name: 'libre', children: [] },
        });
      }
    },
    Delete: async () => {
      if (!file) {
        return;
      }

      if (file.directory?.name)
        if (fileSystemStore.rootDirectories.includes(file.directory?.name)) {
          alert('cannot delete');
        }

      if (file?.id && file.directory) {
        await props.rayDb?.deleteOne('fileSystem', file.id);
      }
    },
  };
};

const fileSystemStore = useFileSystemStore();
function onRightClick(
  event: MouseEvent,
  file: FileSystemItem | null,
  calledFrom: 'grid' | 'gridItem',
) {
  contextMenuStore.initializeContextMenu(
    calledFrom === 'grid' ? primaryActionsGrid : primaryActionsGridItem,
    calledFrom === 'grid' ? secondaryActionsGrid : secondaryActionsGridItem,
    { left: event.clientX, top: event.clientY },
    calledFrom === 'grid' ? actionsGrid() : actionsGridItem(file),
  );
  contextMenuStore.show();
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
          :is="directorySvg"
          :custom-width="60"
          :custom-height="60"
          :style="{ marginLeft: '5px' }"
        />
        {{ fileSystemItem.directory?.name }}
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
  height: 100px;
  color: var(--text-color);
  padding: 10px;
}

.item:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>
