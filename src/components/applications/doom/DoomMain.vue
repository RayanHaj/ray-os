<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface DosFS {
  extract(url: string): Promise<void>;
}

type DosMain = (args: string[]) => void;

interface DosInstance {
  ready(cb: (fs: DosFS, main: DosMain) => void): void;
  stop(): void;
}

interface DosOptions {
  wdosboxUrl: string;
}

declare global {
  interface Window {
    Dos?: (element: HTMLCanvasElement, options: DosOptions) => DosInstance;
  }
}

const dosCanvas = ref<HTMLCanvasElement | null>(null);
let dosInstance: DosInstance | null = null;

const JSDOS_URL = 'https://js-dos.com/6.22/current/js-dos.js';
const WDOSBOX_URL = 'https://js-dos.com/6.22/current/wdosbox.js';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script: HTMLScriptElement = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

onMounted(async () => {
  if (!dosCanvas.value) return;

  await loadScript(JSDOS_URL);

  if (!window.Dos) {
    throw new Error('js-dos failed to load');
  }

  dosInstance = window.Dos(dosCanvas.value, { wdosboxUrl: WDOSBOX_URL });

  dosInstance.ready(async (fs, main) => {
    await fs.extract('/doom-shareware.zip');

    main(['-c', 'cd DOOMS', '-c', 'DOOM.EXE']);
  });
});

onUnmounted(() => {
  dosInstance?.stop();
});
</script>

<template>
  <canvas ref="dosCanvas" class="dos-canvas"></canvas>
</template>

<style scoped>
.dos-canvas {
  width: 100%;
  height: 100%;
  background: black;
}
</style>
