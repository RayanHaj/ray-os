<script setup lang="ts">
import { computed, type StyleValue } from 'vue';
import { useContextMenuStore } from '@/stores/contextMenu.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';

const contextMenuStore = useContextMenuStore();

const contextMenuStyle = computed<StyleValue>(() => {
  return {
    left: `${contextMenuStore.position.left}px`,
    top: `${contextMenuStore.position.top}px`,
    height: `${contextMenuStore.contextMenuHeight}px`,
    width: `${contextMenuStore.contextMenuWidth}px`,
  };
});

const showDivider = computed(
  () => contextMenuStore.primaryActions.length > 0 && contextMenuStore.secondaryActions.length > 0,
);
</script>
<template>
  <div class="context-menu" :style="contextMenuStyle">
    <div v-if="contextMenuStore.primaryActions.length > 0" class="primary-actions">
      <button
        v-for="action of contextMenuStore.primaryActions"
        :key="action"
        @click="contextMenuStore.setClickedButton(action)"
        class="primary-action"
      >
        <component :is="useSvgOrFallback(action).svg" />
      </button>
    </div>
    <hr v-if="showDivider" />
    <div v-if="contextMenuStore.secondaryActions.length > 0" class="secondary-actions">
      <button
        class="secondary-action"
        v-for="action of contextMenuStore.secondaryActions"
        :key="action.id"
        @click="contextMenuStore.setClickedButton(action.id)"
        :disabled="action.disabled"
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

.primary-action svg {
  height: 18px;
  width: 18px;
}

.primary-action:hover {
  background-color: var(--button-hover-color);
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

.secondary-action:disabled {
  background: rgba(0, 0, 0, 0.5);
  color: #666666;
}

.secondary-action:hover:not([disabled]) {
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
}
</style>
