<script setup lang="ts">
import { type Component, onBeforeMount, ref, shallowRef, watch } from 'vue';
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts';
import type { PrimaryActionsContextMenu } from '@/types/PrimaryActionsContextMenu.ts';
import type { SecondaryActionsContextMenu } from '@/types/SecondaryActionsContextMenu.ts';

const props = withDefaults(
  defineProps<{
    primaryActions?: PrimaryActionsContextMenu[];
    secondaryActions?: SecondaryActionsContextMenu[];
    mousePosition?: { left: number; top: number };
  }>(),
  {
    primaryActions: () => ['Copy', 'Paste', 'Delete'],
    secondaryActions: () => [],
  },
);

const positionStyles = ref({
  left: 100,
  top: 100,
});

const primaryActionsSvgs = shallowRef<Record<string, Component>>({});

watch(
  () => props.mousePosition,
  () => {
    positionStyles.value = props.mousePosition ?? positionStyles.value;
  },
);
onBeforeMount(async () => {
  for (const action of props.primaryActions) {
    const svg = await useSvgByFileNameAndDirectory('ui', action);
    if (svg) {
      primaryActionsSvgs.value[action] = svg;
    }
  }
});

const emits = defineEmits(['action:clicked']);
</script>

<template>
  <div class="context-menu" :style="{ left: `${positionStyles.left}px`, top: `${positionStyles.top}px` }">
    <div class="primary-actions">
      <button
        class="primary-action"
        v-for="action of primaryActions"
        :key="action"
        @click="emits('action:clicked', action)"
      >
        <component :is="primaryActionsSvgs[action]" :custom-height="20" :custom-width="20" />
      </button>
    </div>
    <hr/>
    <div class="secondary-actions">
      <button
        class="secondary-action"
        v-for="action of secondaryActions"
        :key="action.id"
        @click="emits('action:clicked', action.id)"
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
