<script setup lang="ts">
import TerminalLine from '@/components/applications/terminal/TerminalLine.vue';
import { onBeforeMount, ref } from 'vue';

const terminalLineCount = ref<number>(1);
const defaultLines = ['RayOS Terminal', ''];

onBeforeMount(() => {
  terminalLineCount.value = defaultLines.reduce((accumulator, _) => accumulator + 1, 1);
});

function onEnter(command: string) {
  defaultLines.push(command);
  terminalLineCount.value += 1;
}

function isReadonly(lineNumber: number) {
  return lineNumber !== terminalLineCount.value;
}
</script>

<template>
  <div class="terminal">
    <TerminalLine
      v-for="lineNumber of terminalLineCount"
      :key="lineNumber"
      :input-value="typeof defaultLines[lineNumber-1] !== 'undefined' ? defaultLines[lineNumber-1] : null"
      :readonly="isReadonly(lineNumber)"
      @enter-pressed="onEnter"
    />
  </div>
</template>

<style scoped>
.terminal {
  display: flex;
  flex-direction: column;
  color: var(--text-color);
  background-color: black;
  padding: 10px;
  gap: 5px;
}
</style>
