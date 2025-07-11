<script setup lang="ts">
import { nextTick, onBeforeMount, onMounted, ref } from 'vue';

const { inputValue, readonly } = defineProps<{ inputValue: string | null; readonly: boolean }>();

const currentLocation = ref<string>();
onBeforeMount(() => {
  if (!readonly) {
    currentLocation.value = 'PS C:\\>';
  }
});

const terminalLine = ref();
onMounted(async () => {
  await nextTick();

  setTimeout(() => {
    terminalLine.value.focus();
  }, 0);
});

const emit = defineEmits(['enter-pressed']);
function onEnter(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  if (target.textContent) {
    const text = target.textContent ?? '';
    emit('enter-pressed', text);
  }
}
</script>

<template>
  <div v-if="!readonly" class="wrapper">
    <p v-if="currentLocation" class="current-location">{{ currentLocation }}</p>
    <div ref="terminalLine" class="terminal-line" contenteditable="true" @keydown.enter.prevent="onEnter($event)">
      <p v-if="inputValue">{{ inputValue }}</p>
    </div>
  </div>

  <div v-else-if="readonly" class="wrapper">
    <p v-if="currentLocation" class="current-location">{{ currentLocation }}</p>
    <div class="terminal-line">
      <p v-if="inputValue">{{ inputValue }}</p>
    </div>
  </div>

  <p v-else>{{ inputValue }}</p>
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
  color: var(--text-color);
  height: fit-content;
  resize: none;
  outline: none;
  background: none;
  border: none;
  text-wrap: wrap;
  overflow-wrap: anywhere;
}
</style>
