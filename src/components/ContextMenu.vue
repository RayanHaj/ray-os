<script setup lang="ts">
import { type Component, computed, onBeforeMount, shallowRef } from 'vue';
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts';
import type { SecondaryActionsContextMenu } from '@/types/SecondaryActionsContextMenu.ts';
import { useContextMenuStore } from '@/stores/contextMenu.ts';
import type {
  AllPrimaryActionsContextMenu,
  PrimaryActionsContextMenu,
} from '@/types/PrimaryActionsContextMenu.ts';

const primaryActionsSvgs = shallowRef<Record<string, Component>>({});
onBeforeMount(async () => {
  for (const action of ['Copy', 'Paste', 'Delete', 'Rename'] as AllPrimaryActionsContextMenu) {
    const svg = await useSvgByFileNameAndDirectory('ui', action);
    if (svg) {
      primaryActionsSvgs.value[action] = svg;
    }
  }
});

const contextMenuStore = useContextMenuStore();
const mousePosition = computed<{ left: number; top: number }>(
  () => contextMenuStore.contextMenusProperties.mousePosition ?? { left: 100, top: 100 },
);
const primaryActions = computed<PrimaryActionsContextMenu[]>(
  () => contextMenuStore.contextMenusProperties.primaryActions ?? ['Copy', 'Paste', 'Delete'],
);
const secondaryActions = computed<SecondaryActionsContextMenu[]>(
  () => contextMenuStore.contextMenusProperties.secondaryActions ?? [],
);
</script>

<template>
  <div
    class="context-menu"
    :style="{ left: `${mousePosition.left}px`, top: `${mousePosition.top}px` }"
  >
    <div class="primary-actions">
      <button
        class="primary-action"
        v-for="action of primaryActions"
        :key="action"
        @click="contextMenuStore.setClickedButton(action)"
      >
        <component :is="primaryActionsSvgs[action]" :custom-height="20" :custom-width="20" />
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
  width: 200px;
  height: 300px;
  background: var(--tabs-background);
  border: var(--window-border-color) solid 2px;
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
  background: var(--button-primary-color);
  text-align: center;
  padding: 5px 5px 1px 5px;
  border-radius: 5px;
}

.primary-action:hover {
  background: var(--button-hover-color);
}

.secondary-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.secondary-action {
  text-align: center;
  width: 100%;
  height: 50px;
}

hr {
  width: 100%;
  border: none;
  height: 2px;
  background: var(--window-border-color);
}

button {
  background: none;
  border: none;
  color: var(--text-color);
}
</style>
