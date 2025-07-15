<script setup lang="ts">
import TerminalLine from '@/components/applications/terminal/TerminalLine.vue';
import { nextTick, ref } from 'vue';
import { useHandleTerminalCommand } from '@/composables/useHandleTerminalCommand.ts';
import { useInjectOrThrow } from '@/composables/useInjectOrThrow.ts';

const lines = ref(['RayOS Terminal', '']);
const terminal = ref();

const windowIdObject = useInjectOrThrow<{ windowName: string, id: number }>('windowIdObject');
async function onEnter(command: string) {
  lines.value[lines.value.length - 1] = command;

  const commandObject = useHandleTerminalCommand(command, lines, windowIdObject);
  if (commandObject?.command === 'cls') {
    await nextTick();
  }

  pushNewEmptyLine();
}

function pushNewEmptyLine() {
  lines.value.push('');
}

function isReadonly(lineNumber: number) {
  return lineNumber < lines.value.length - 1;
}
</script>

<template>
  <div ref="terminal" class="terminal">
    <TerminalLine
      v-for="(_, index) of lines"
      :key="index"
      :input-value="typeof lines[index] !== 'undefined' ? lines[index] : null"
      :isReadonly="isReadonly(index)"
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
