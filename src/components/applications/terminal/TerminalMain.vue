<script setup lang="ts">
import TerminalLine from '@/components/applications/terminal/TerminalLine.vue';
import { nextTick, onBeforeMount, ref } from 'vue';
import { useHandleTerminalCommand } from '@/composables/terminal/useHandleTerminalCommand.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import type { LineTerminal } from '@/types/TerminalTypes.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const windowId = useInjectOrThrow<string>('windowId');

const emptyLine = { line: '', isPlain: false };
const lines = ref<LineTerminal[]>([
  { line: 'RayOS Terminal — type "help" for commands', isPlain: true },
  emptyLine,
]);

const cachedLines = ref<LineTerminal[]>([]);
const currentCacheIndex = ref<number>(-1);

const fontSize = ref(20);
const currentPath = ref<string[]>([]);

const FONT_SIZE_LS_KEY = 'terminalFontSize';
onBeforeMount(() => {
  currentPath.value = [useFileSystemStore().rootDirectory];
  const fontSizeLS = localStorage.getItem(FONT_SIZE_LS_KEY);
  if (fontSizeLS !== null) {
    fontSize.value = Number(fontSizeLS);
  }
});

const lineIndexesOfErrorLines = ref<number[]>([]);
async function onEnter(command: string) {
  if (lines.value.length > 0) {
    lines.value[lines.value.length - 1] = { line: command, isPlain: false };
  }

  const commandObject = await useHandleTerminalCommand(
    rayDb,
    command,
    lines,
    currentPath,
    windowId,
  );

  if (commandObject instanceof Error) {
    lines.value.push({ line: commandObject.message, isPlain: true });
    lineIndexesOfErrorLines.value.push(lines.value.length - 1);
  } else if (commandObject.command === 'cls') {
    lineIndexesOfErrorLines.value = [];
    await nextTick();
  }

  cachedLines.value.push({ line: command, isPlain: false });

  pushNewEmptyLine();
  return commandObject;
}

function onLineInput() {
  if (currentCacheIndex.value === -1) return;
  currentCacheIndex.value = -1;
}

function pushNewEmptyLine() {
  lines.value.push(emptyLine);
}

function isReadonly(lineNumber: number) {
  return lineNumber < lines.value.length - 1;
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Control') {
    document.addEventListener('wheel', onResizing, { passive: false });
  }
}

const terminalLineRef = ref();
function onKeyUp(event: KeyboardEvent) {
  switch (event.key) {
    case 'Control':
      {
        document.removeEventListener('wheel', onResizing);
      }
      break;
    case 'ArrowUp':
      {
        if (cachedLines.value.length === 0) return;

        if (currentCacheIndex.value === -1) {
          currentCacheIndex.value = cachedLines.value.length - 1;
        } else if (currentCacheIndex.value > 0) {
          currentCacheIndex.value--;
        }

        lines.value[lines.value.length - 1] = cachedLines.value[currentCacheIndex.value];

        terminalLineRef.value.focusAtEnd();
      }
      break;
    case 'ArrowDown': {
      if (cachedLines.value.length === 0 || currentCacheIndex.value === -1) return;

      if (currentCacheIndex.value < cachedLines.value.length - 1) {
        currentCacheIndex.value++;
      }

      lines.value[lines.value.length - 1] = cachedLines.value[currentCacheIndex.value];

      terminalLineRef.value.focusAtEnd();
    }
  }
}

const onResizing = (event: WheelEvent) => {
  event.preventDefault();

  const FONT_SIZE_STEP = 1;
  if (event.deltaY < 0) {
    if (fontSize.value < 100) {
      fontSize.value += FONT_SIZE_STEP;
      localStorage.setItem(FONT_SIZE_LS_KEY, fontSize.value.toString());
    }
  } else {
    if (fontSize.value > 2) {
      fontSize.value -= FONT_SIZE_STEP;
      localStorage.setItem(FONT_SIZE_LS_KEY, fontSize.value.toString());
    }
  }
};
</script>

<template>
  <div
    class="terminal"
    @keydown="onKeyDown"
    @keyup="onKeyUp"
    :style="{ fontSize: `${fontSize}px` }"
  >
    <TerminalLine
      v-for="(_, index) of lines"
      :ref="(el) => index === lines.length - 1 && el && (terminalLineRef = el)"
      :key="index"
      :input-value="lines[index]"
      :is-readonly="isReadonly(index)"
      :current-path="currentPath.join('/')"
      :is-error="lineIndexesOfErrorLines.includes(index)"
      :window-id="windowId"
      @enter-pressed="onEnter"
      @on-input="onLineInput"
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
