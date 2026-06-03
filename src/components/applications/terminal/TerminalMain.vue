<script setup lang="ts">
import TerminalLine from '@/components/applications/terminal/TerminalLine.vue';
import { nextTick, onBeforeMount, ref } from 'vue';
import { useHandleTerminalCommand } from '@/composables/terminal/useHandleTerminalCommand.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useFileSystemStore } from '@/stores/fileSystem.ts';
import type { LineTerminal } from '@/types/terminalTypes.js';
import { useTerminalStore } from '@/stores/terminal.ts';
import { useBrowserStore } from '@/stores/browser.ts';

const rayDb = useInjectOrThrow<RayDb>('rayDb');
const windowId = useInjectOrThrow<string>('windowId');

const terminalStore = useTerminalStore();

const lines = ref<LineTerminal[]>([
  { line: 'RayOS Terminal — type "help" for commands', isPlain: true },
  terminalStore.emptyLine,
]);

const currentPath = ref<string[]>([]);
const currentCacheIndex = ref<number>(-1);

const fontSize = ref(useBrowserStore().isMobile ? 16 : 20);
onBeforeMount(async () => {
  currentPath.value = [useFileSystemStore().ROOT_DIR_NAME];
  const fontSizeLS = localStorage.getItem(terminalStore.FONT_SIZE_LS_KEY);
  if (fontSizeLS !== null) {
    fontSize.value = Number(fontSizeLS);
  }

  const commandCacheLs = localStorage.getItem(terminalStore.LS_COMMAND_CACHE_KEY);
  if (commandCacheLs !== null) {
    try {
      const parsedCommandCache = (await JSON.parse(commandCacheLs)) as LineTerminal[];

      if (parsedCommandCache.length > 0) {
        terminalStore.cachedLines = parsedCommandCache;
      }
    } catch (e) {
      console.error(e);
      localStorage.setItem(terminalStore.LS_COMMAND_CACHE_KEY, JSON.stringify([]));
    }
  } else {
    localStorage.setItem(terminalStore.LS_COMMAND_CACHE_KEY, JSON.stringify([]));
  }
});

const lineIndexesOfErrorLines = ref<number[]>([]);
async function onEnter(command: string) {
  currentCacheIndex.value = -1;

  if (lines.value.length > 0) {
    lines.value[lines.value.length - 1] = { line: command, isPlain: false };
  }

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

  pushNewEmptyLine();
  return commandObject;
}

function onLineInput(value: string) {
  lines.value[lines.value.length - 1] = { line: value, isPlain: false };
  currentCacheIndex.value = -1;
}

function pushNewEmptyLine() {
  lines.value.push(terminalStore.emptyLine);
}

function isReadonly(lineNumber: number) {
  return lineNumber < lines.value.length - 1;
}

const terminalLineRef = ref();
function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Control') {
    document.addEventListener('wheel', onResizing, { passive: false });
  }

  switch (event.key) {
    case 'ArrowUp':
      {
        event.preventDefault();
        if (terminalStore.cachedLines.length === 0) return;

        if (currentCacheIndex.value === -1) {
          currentCacheIndex.value = terminalStore.cachedLines.length - 1;
        } else if (currentCacheIndex.value > 0) {
          currentCacheIndex.value--;
        }

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

async function onKeyUp(event: KeyboardEvent) {
  if (event.key === 'Control') {
    document.removeEventListener('wheel', onResizing);
  }
}

const onResizing = (event: WheelEvent) => {
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
      v-for="(_, index) of lines"
      :ref="(el) => index === lines.length - 1 && el && (terminalLineRef = el)"
      :key="index"
      :window-id="windowId"
      :current-path="currentPath.join('/')"
      :input-value="lines[index]"
      :is-readonly="isReadonly(index)"
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
}
</style>
