<script setup lang="ts">
import TerminalLine from '@/components/applications/terminal/TerminalLine.vue';
import { nextTick, onBeforeMount, ref } from 'vue';
import { useHandleTerminalCommand } from '@/composables/terminal/useHandleTerminalCommand.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useFileSystemStore } from '@/stores/fileSystem.ts';

const emptyLine = { line: '', isPlain: false };
const lines = ref<Array<{ line: string; isPlain: boolean }>>([
  { line: 'RayOS Terminal', isPlain: true },
  emptyLine,
]);

const terminal = ref();

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const windowId = useInjectOrThrow<string>('windowId');
const currentPath = ref<string[]>([]);

onBeforeMount(() => {
  currentPath.value = [useFileSystemStore().rootDirectory];
});

const lineIndexesOfErrorLines = ref<number[]>([]);
async function onEnter(command: string) {
  lines.value[lines.value.length - 1] = { line: command, isPlain: false };
  const commandObject = await useHandleTerminalCommand(
    rayDb,
    command,
    lines,
    currentPath,
    windowId,
  );

  if (commandObject instanceof Error) {
    lineIndexesOfErrorLines.value.push(lines.value.length);
    lines.value.push({ line: commandObject.message, isPlain: true });
  } else if (commandObject.command === 'cls') {
    lineIndexesOfErrorLines.value = [];
    await nextTick();
  }

  pushNewEmptyLine();
  return commandObject;
}

function pushNewEmptyLine() {
  lines.value.push(emptyLine);
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
      :input-value="lines[index]"
      :is-readonly="isReadonly(index)"
      :current-path="currentPath.join('/')"
      :is-error="lineIndexesOfErrorLines.includes(index)"
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
