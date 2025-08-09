<script setup lang="ts">
import { nextTick, onBeforeMount, ref, watchEffect } from 'vue';
import { useNotepadStore } from '@/stores/notepad.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import NotepadHeader from '@/components/applications/notepad/NotepadHeader.vue';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';

const windowId = useInjectOrThrow<string>('windowId');
const notepadStore = useNotepadStore();

const loadedFile = ref<{ windowId: string; fileName: string; text: string }>();
onBeforeMount(async () => await nextTick());
watchEffect(() => {
  if (notepadStore.loadedFile?.windowId !== windowId) {
    return;
  }

  loadedFile.value = notepadStore.loadedFile;
  notepadStore.loadedFile = undefined;
});
</script>

<template>
  <div class="text-reader-container">
    <div class="open-text-file-section" v-if="!loadedFile">
      <div class="open-text-file-block">
        <p class="select-text-file-p">Select a text file</p>
        <button class="select-text-file-button"><component :is="useSvgOrFallback('Upload').svg" :custom-height='50' :custom-width="50"/></button>
      </div>
    </div>
    <div class="text-file-reader" v-else>
      <NotepadHeader :file-name="loadedFile.fileName" />
      <div class="text" contenteditable="true">
        <pre>{{ loadedFile.text }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-reader-container {
  background-color: var(--background-color);
  overflow: hidden;
  position: relative;
}

.text {
  padding: 10px;
  color: var(--text-color);
  height: calc(100% - 50px);
  overflow: auto;
}

.open-text-file-section,
.text-file-reader {
  height: 100%;
}

.open-text-file-section {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.open-text-file-block {
  display: flex;
  flex-direction: column;
  height: 50%;
  width: 50%;
  min-width: fit-content;
  min-height: fit-content;
  background-color: var(--accent-color);
  padding: 10px;
  border-radius: 10px;
  gap: 5px;
}

.select-text-file-p {
  font-size: var(--font-size-elg);
  color: var(--text-color);
  background-color: var(--input-primary-color);
  padding: 5px;
  width: 100%;
  border-radius: 2px;
}

.select-text-file-button {
  width: 100%;
  height: 100%;
  min-height: fit-content;
  background-color: var(--button-primary-color);
}
</style>
