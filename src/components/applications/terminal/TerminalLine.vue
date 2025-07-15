<script setup lang="ts">
import { onBeforeMount, ref, watchEffect } from 'vue';

const { inputValue, isReadonly } = defineProps<{ inputValue: string | null; isReadonly: boolean }>();

const currentLocation = ref<string>();
onBeforeMount(() => {
  if (!isReadonly) {
    currentLocation.value = 'PS C:\\>';
  }
});

const terminalLineRef = ref();
watchEffect( () => {
  if (!terminalLineRef.value || isReadonly) {
    return;
  }

  terminalLineRef.value.focus();
});

const emit = defineEmits(['enter-pressed']);
function onEnter(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  if (target.textContent) {
    const command = target.textContent ?? '';
    emit('enter-pressed', command);
  }
}
</script>

<template>
  <div v-if="!isReadonly" class="wrapper">
    <p v-if="currentLocation" class="current-location">{{ currentLocation }}</p>
    <div ref="terminalLineRef" class="terminal-line" contenteditable="true" @keydown.enter.prevent="onEnter($event)">
      <p v-if="inputValue">{{ inputValue }}</p>
    </div>
  </div>

  <div v-else-if="isReadonly" class="wrapper">
    <p v-if="currentLocation" class="current-location">{{ currentLocation }}</p>
    <div class="terminal-line">
      <p v-if="inputValue"><span class="input-value">{{ inputValue }}</span></p>
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
  white-space: pre-wrap;
}
</style>
