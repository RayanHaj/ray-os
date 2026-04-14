<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue';
import { useWindowStore } from '@/stores/window.ts';

const { currentPath, inputValue, isReadonly, isError, windowId } = defineProps<{
  currentPath: string;
  inputValue: { line: string | Error; isPlain: boolean };
  isReadonly: boolean;
  isError: boolean;
  windowId: string;
}>();

const path = ref<string>('');
const terminalLineRef = ref();

onBeforeMount(() => {
  path.value = currentPath;
});

onMounted(() => {
  terminalLineRef.value?.focus();
});

watch(
  () => useWindowStore().zIndexesOrder,
  (newValue, oldValue) => {
    if (newValue === oldValue) {
      return;
    }

    if (newValue[newValue.length - 1] === windowId) {
      terminalLineRef.value?.focus();
    }
  },
);

const emit = defineEmits(['enter-pressed']);

function onEnter(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  if (target.textContent) {
    const command = target.textContent ?? '';
    emit('enter-pressed', command);
  }
}

const displayPath = computed(() => `PS ${path.value}>`);
</script>

<template>
  <div v-if="!isReadonly" class="wrapper">
    <p v-if="!inputValue.isPlain" class="current-location">{{ displayPath }}</p>
    <div
      ref="terminalLineRef"
      class="terminal-line"
      contenteditable="true"
      @keydown.enter.prevent="onEnter($event)"
      @blur="
        () => {
          if (useWindowStore().getFocusedWindowId() === windowId) {
            return terminalLineRef?.focus();
          }
        }
      "
    >
      <p v-if="inputValue.line">{{ inputValue.line }}</p>
    </div>
  </div>

  <div
    v-else-if="isReadonly"
    class="wrapper"
    :style="{ color: isError ? 'red' : 'var(--text-color)' }"
  >
    <p v-if="!inputValue.isPlain" class="current-location">{{ displayPath }}</p>
    <div class="terminal-line">
      <p v-if="inputValue.line">
        <span class="input-value">{{ inputValue.line }}</span>
      </p>
    </div>
  </div>

  <p v-else>{{ inputValue.line }}</p>
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
