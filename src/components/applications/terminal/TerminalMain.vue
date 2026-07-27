<script setup lang="ts">
import TerminalLine from '@/components/applications/terminal/TerminalLine.vue';
import { nextTick, onBeforeMount, ref } from 'vue';
import { useHandleTerminalCommand } from '@/composables/terminal/useHandleTerminalCommand.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import {
  createEmptyLineTerminal,
  createInitialLineTerminal,
  type LineTerminal,
} from '@/types/terminalTypes.js';
import { useTerminalStore } from '@/stores/terminal.ts';
import { useBrowserStore } from '@/stores/browser.ts';
import { useGetLSTerminalFontSize } from '@/composables/terminal/useGetLSTerminalFontSize.ts';
import { useSetLSCommandCache } from '@/composables/terminal/useSetLSCommandCache.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const windowId = useInjectOrThrow<string>('windowId');

const terminalStore = useTerminalStore();

const lines = ref<LineTerminal[]>([createInitialLineTerminal(), createEmptyLineTerminal()]);

const currentPath = ref<string[]>([useFileSystemStore().ROOT_DIR_NAME]);
const currentCacheIndex = ref<number>(-1);

const getInitialFontSize = () => (useBrowserStore().isMobile ? 16 : 20);

const fontSize = ref<number>(getInitialFontSize());

onBeforeMount(async () => {
  const lsFontSize = useGetLSTerminalFontSize();
  if (lsFontSize) fontSize.value = lsFontSize;

  await useSetLSCommandCache();
});

const lineIndexesOfErrorLines = ref<number[]>([]);
async function onEnter(command: string) {
  currentCacheIndex.value = -1;

  if (lines.value.length > 0)
    lines.value[lines.value.length - 1] = { line: command, isPlain: false };

  const commandObject = await useHandleTerminalCommand(
    rayDb,
    windowId,
    command,
    currentPath,
    lines,
  );

  if (commandObject instanceof Error) {
    lines.value.push({ line: commandObject.message, isPlain: true });
    lineIndexesOfErrorLines.value.push(lines.value.length - 1);
  } else if (commandObject.command === 'cls') {
    lineIndexesOfErrorLines.value = [];
    await nextTick();
  }

  if (commandObject instanceof Error || commandObject.command !== 'cls-history') {
    const previousCachedLine = terminalStore.cachedLines[terminalStore.cachedLines.length - 1];

    if (previousCachedLine === undefined || previousCachedLine.line !== command) {
      terminalStore.cachedLines.push({ line: command, isPlain: false });

      const commandCacheLs = localStorage.getItem(terminalStore.LS_COMMAND_CACHE_KEY);
      if (commandCacheLs !== null) {
        try {
          const parsedCommandCache = JSON.parse(commandCacheLs) as LineTerminal[];
          localStorage.setItem(
            terminalStore.LS_COMMAND_CACHE_KEY,
            JSON.stringify([...parsedCommandCache, { line: command, isPlain: false }]),
          );
        } catch (e) {
          console.error(e);
          localStorage.setItem(terminalStore.LS_COMMAND_CACHE_KEY, JSON.stringify([]));
        }
      } else {
        localStorage.setItem(
          terminalStore.LS_COMMAND_CACHE_KEY,
          JSON.stringify([{ line: command, isPlain: false }]),
        );
      }
    }
  }

  pushEmptyLine();
  return commandObject;
}

function onLineInput(value: string) {
  lines.value[lines.value.length - 1] = { line: value, isPlain: false };
  currentCacheIndex.value = -1;
}

const pushEmptyLine = () => lines.value.push(createEmptyLineTerminal());

const terminalLineRef = ref();
function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Control') {
    document.addEventListener('wheel', onMouseWheel, { passive: false });
  }

  switch (event.key) {
    case 'ArrowUp':
      {
        event.preventDefault();
        if (terminalStore.cachedLines.length === 0) return;

        if (currentCacheIndex.value <= 0) {
          currentCacheIndex.value = terminalStore.cachedLines.length - 1;
        } else currentCacheIndex.value--;

        lines.value[lines.value.length - 1] = {
          ...terminalStore.cachedLines[currentCacheIndex.value],
        };

        terminalLineRef.value.focusAtEnd();
      }
      break;
    case 'ArrowDown':
      {
        event.preventDefault();
        if (terminalStore.cachedLines.length === 0 || currentCacheIndex.value === -1) return;

        if (currentCacheIndex.value < terminalStore.cachedLines.length - 1) {
          currentCacheIndex.value++;
        }

        lines.value[lines.value.length - 1] = {
          ...terminalStore.cachedLines[currentCacheIndex.value],
        };

        terminalLineRef.value.focusAtEnd();
      }
      break;
  }
}

const onKeyUp = (event: KeyboardEvent): void => {
  if (event.key === 'Control') document.removeEventListener('wheel', onMouseWheel);
};

const onMouseWheel = (event: WheelEvent) => {
  event.preventDefault();

  const FONT_SIZE_STEP = 1;
  if (event.deltaY < 0) {
    if (fontSize.value < 100) {
      fontSize.value += FONT_SIZE_STEP;
      localStorage.setItem(terminalStore.FONT_SIZE_LS_KEY, fontSize.value.toString());
    }
  } else {
    if (fontSize.value > 2) {
      fontSize.value -= FONT_SIZE_STEP;
      localStorage.setItem(terminalStore.FONT_SIZE_LS_KEY, fontSize.value.toString());
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
      v-for="(line, index) of lines"
      :ref="(el) => index === lines.length - 1 && el && (terminalLineRef = el)"
      :key="index"
      :window-id="windowId"
      :current-path="currentPath.join('/')"
      :line="line"
      :is-readonly="index < lines.length - 1"
      :is-error="lineIndexesOfErrorLines.includes(index)"
      @enter-pressed="onEnter"
      @on-input="onLineInput"
    />
  </div>
</template>

<style scoped>
.terminal {
  display: flex;
  flex-direction: column;
  background-color: black;
  padding: 10px;
  gap: 5px;
  overflow: auto;
}
</style>
