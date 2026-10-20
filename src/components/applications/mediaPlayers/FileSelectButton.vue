<script setup lang="ts">
import type { FileType } from '@/types/itemTypes.ts';
import { useWindowStore } from '@/stores/window.ts';
import { useFileExplorerStore } from '@/stores/fileExplorer.ts';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { FileSelectReturnItem } from '@/types/fileExplorerTypes.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';

const { windowId, allowedFileTypes } = defineProps<{
  windowId: string;
  allowedFileTypes: FileType[];
}>();

const emit = defineEmits<{
  (e: 'returnValue', value: { windowId: string; value: FileSelectReturnItem[] }): void;
}>();

const fileExplorerWindowId = ref<string>();
onBeforeUnmount(() => {
  if (fileExplorerWindowId.value) {
    useWindowStore().removeOpenWindowReference(fileExplorerWindowId.value);
  }
});

function handleSelectTextFile() {
  const nextFileExplorerId = useWindowStore().getNextWindowId('File Explorer');

  useFileExplorerStore().setFileExplorerWindowAsFileSelect(
    windowId,
    nextFileExplorerId,
    allowedFileTypes,
    false,
  );

  fileExplorerWindowId.value = useWindowStore().pushOpenWindowReference('File Explorer');
}

const fileExplorerWindowIsOpen = computed(() =>
  useWindowStore().openWindowsReferences['File Explorer']?.some(
    (reference) =>
      useWindowStore().getWindowId('File Explorer', reference.id) === fileExplorerWindowId.value,
  ),
);

watch(
  () => useFileExplorerStore().fileSelectReturnValue,
  async (returnValues) => {
    const returnValue = returnValues.find(
      (fileSelectState) => fileSelectState.windowId === windowId,
    );

    if (!returnValue || !fileExplorerWindowId.value) return;

    emit('returnValue', returnValue);

    useWindowStore().removeOpenWindowReference(fileExplorerWindowId.value, windowId);
  },
);
</script>
<template>
  <div class="file-select-button-container">
    <div class="file-select-button-wrapper">
      <button @click="handleSelectTextFile" :disabled="fileExplorerWindowIsOpen">
        <span class="file-select-button-content">
          <component :is="useSvgOrFallback('Upload').svg" />
          Click to select a <slot>file</slot>
        </span>
      </button>
    </div>
  </div>
</template>
<style scoped>
.file-select-button-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  max-height: 100%;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.file-select-button-container {
  justify-self: start;
}

.file-select-button-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--accent-color);
  padding: 10px;
  border-radius: 10px;
  gap: 5px;
}

.file-select-button-wrapper button {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background: rgb(0, 0, 0, 0.5);
  font-size: var(--font-size-elg);
  border: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.file-select-button-wrapper span {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
}

.file-select-button-wrapper svg {
  width: 50px;
  height: 50px;
}
</style>
