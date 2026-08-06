<script setup lang="ts">
import { computed, nextTick, onBeforeMount, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useWindowStore } from '@/stores/window.ts';
import type { LineTerminal } from '@/types/terminalTypes.js';

const { currentPath, line, isReadonly, isError, windowId } = defineProps<{
  currentPath: string;
  line: LineTerminal;
  isReadonly: boolean;
  isError: boolean;
  windowId: string;
}>();

const emit = defineEmits(['enter-pressed', 'on-input']);

const path = ref<string>('');
const terminalLineRef = useTemplateRef('terminalLineRef');

onBeforeMount(() => path.value = currentPath);
onMounted(() => terminalLineRef.value?.focus());

/**
 * Focuses the terminal input when this window is brought to the front.
 */
watch(
  () => useWindowStore().zIndexesOrder,
  (newValue, oldValue) => {
    if (newValue === oldValue) return;
    if (newValue[newValue.length - 1] === windowId) terminalLineRef.value?.focus();
  },
);

watch(
  () => line.line,
  (newValue) => {
    if (!terminalLineRef.value) return;
    if (terminalLineRef.value.textContent === newValue) return;
    terminalLineRef.value.textContent = newValue;
  },
);

function onEnter(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  if (target.textContent) {
    const command = target.textContent ?? '';
    emit('enter-pressed', command);
  }
}

const displayPath = computed(() => `PS ${path.value}>`);

function focusAtEnd() {
  nextTick(() => {
    if (!terminalLineRef.value) return;

    terminalLineRef.value.focus();
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(terminalLineRef.value);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  });
}

defineExpose({ focusAtEnd });
</script>

<template>
  <div v-if="isReadonly" class="wrapper">
    <p v-if="!line.isPlain" class="current-location">{{ displayPath }}</p>
    <div class="terminal-line">
      <p v-if="line.line">
        <span :style="{ color: isError ? 'red' : 'var(--text-color)' }" class="input-value">{{
          line.line
        }}</span>
      </p>
    </div>
  </div>
  <div v-else class="wrapper">
    <p v-if="!line.isPlain" class="current-location">{{ displayPath }}</p>
    <div
      ref="terminalLineRef"
      class="terminal-line"
      contenteditable="true"
      @input="emit('on-input', ($event.target as HTMLElement).textContent ?? '')"
      @keydown.enter.prevent="onEnter($event)"
      @blur="
        () => {
          if (useWindowStore().getFocusedWindowId() === windowId) {
            return terminalLineRef?.focus();
          }
        }
      "
    />
  </div>
</template>

<style scoped>
* {
  font-family: monospace;
}

.wrapper {
  position: relative;
  display: flex;
  flex-direction: row;
  gap: 5px;
  text-wrap: nowrap;
}

.terminal-line {
  width: 100%;
  height: fit-content;
  resize: none;
  outline: none;
  background: none;
  border: none;
  text-wrap: wrap;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
</style>
