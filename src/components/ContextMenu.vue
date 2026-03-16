<script setup lang="ts">
import { type Component, computed, onBeforeMount, ref, shallowRef, watchEffect } from 'vue';
import { useSvgByFileNameAndDirectory } from '@/composables/svg/useSvgByFileNameAndDirectory.ts';
import {
  type SecondaryActionsContextMenu,
  type AllPrimaryActionsContextMenu,
  type PrimaryActionsContextMenu,
} from '@/types/ContextMenuTypes.ts';
import { useContextMenuStore } from '@/stores/contextMenu.ts';
import { useTaskbarStore } from '@/stores/taskbar.ts';
import { useBrowserStore } from '@/stores/browser.ts';

const primaryActionsSvgs = shallowRef<Record<string, Component>>({});
onBeforeMount(async () => {
  for (const action of ['Copy', 'Paste', 'Delete', 'Rename'] as AllPrimaryActionsContextMenu) {
    const svg = await useSvgByFileNameAndDirectory(action);
    if (svg) {
      primaryActionsSvgs.value[action] = svg;
    }
  }
});

const contextMenuStore = useContextMenuStore();
const contextMenuHeight = ref(300);
const contextMenuWidth = ref(200);

const mousePosition = computed<{ left: number; top: number }>(
  () => contextMenuStore.contextMenusProperties.mousePosition ?? { left: 100, top: 100 },
);

watchEffect(() => {
  const withinBorders =
    useBrowserStore().height -
      mousePosition.value.top -
      contextMenuHeight.value -
      useTaskbarStore().taskbarHeight >
    0;
  const maximumContextMenuTop =
    useBrowserStore().height - useTaskbarStore().taskbarHeight - contextMenuHeight.value - 10;
  if (!withinBorders) {
    mousePosition.value.top = maximumContextMenuTop;
  }
});

watchEffect(() => {
  const withinBorders =
    useBrowserStore().width - mousePosition.value.left - contextMenuWidth.value > 0;
  const maximumContextMenuLeft = useBrowserStore().width - contextMenuWidth.value - 10;
  if (!withinBorders) {
    mousePosition.value.left = maximumContextMenuLeft;
  }
});

const fallbackPrimaryActions: PrimaryActionsContextMenu[] = ['Copy', 'Paste', 'Delete', 'Rename'];

const primaryActions = computed<PrimaryActionsContextMenu[]>(
  () =>
    (contextMenuStore.contextMenusProperties.primaryActions as
      | PrimaryActionsContextMenu[]
      | undefined) ?? fallbackPrimaryActions,
);

const secondaryActions = computed<SecondaryActionsContextMenu[]>(
  () =>
    (contextMenuStore.contextMenusProperties.secondaryActions as
      | SecondaryActionsContextMenu[]
      | undefined) ?? [],
);
</script>

<template>
  <div
    class="context-menu"
    :style="{
      left: `${mousePosition.left}px`,
      top: `${mousePosition.top}px`,
      height: `${contextMenuHeight}px`,
      width: `${contextMenuWidth}px`,
    }"
  >
    <div class="primary-actions">
      <button
        class="primary-action"
        v-for="action of primaryActions"
        :key="action"
        @click="contextMenuStore.setClickedButton(action)"
      >
        <component :is="primaryActionsSvgs[action]" :custom-height="18" :custom-width="18" />
      </button>
    </div>
    <hr />
    <div class="secondary-actions">
      <button
        class="secondary-action"
        v-for="action of secondaryActions"
        :key="action.id"
        @click="contextMenuStore.setClickedButton(action.id)"
      >
        {{ action.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.context-menu {
  position: absolute;
  display: flex;
  flex-direction: column;
  background: var(--tabs-background);
  border: var(--button-primary-color) solid 2px;
  border-radius: 10px;
  z-index: 9999;
}

.primary-actions {
  display: flex;
  flex-direction: row;
  justify-content: start;
  padding: 10px;
  gap: 5px;
}

.primary-action {
  border: var(--button-primary-color) solid 2px;
  text-align: center;
  padding: 2px 2px 0 2px;
  border-radius: 2px;
}

.primary-action:hover {
  background: var(--button-hover-color);
}

.secondary-actions {
  display: flex;
  flex-direction: column;
}

.secondary-action {
  text-align: start;
  padding-inline: 10px;
  width: 100%;
  height: 25px;
  border-bottom: 1px var(--button-primary-color) solid;
}

.secondary-action:hover {
  background-color: var(--button-hover-color);
}

hr {
  width: 100%;
  border: none;
  height: 2px;
  background: var(--button-primary-color);
}

button {
  background: none;
  border: none;
  color: var(--text-color);
}
</style>
