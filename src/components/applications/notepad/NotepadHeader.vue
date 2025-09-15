<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useSanitizeFileName } from '@/composables/fileSystem/useSanitizeFileName.ts';
import { useValidateFileName } from '@/composables/fileSystem/useValidateFileName.ts';
import { useToastStore } from '@/stores/toast.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';

const { fileName } = defineProps<{ fileName: string }>();
const emit = defineEmits(['onSaveChanges']);

const fileNameRef = ref('');
onBeforeMount(() => {
  fileNameRef.value = fileName;
});

defineExpose({'fileName': fileNameRef});

const windowId = useInjectOrThrow<string>('windowId');
function onInput(event: InputEvent) {
  fileNameRef.value = (event.target as HTMLParagraphElement).innerText;
}

function onBlur(event: FocusEvent) {
  const fileName = useSanitizeFileName((event.target as HTMLParagraphElement).innerText);
  if (!useValidateFileName(fileName)) {
    useToastStore().createToast('file name to long', 'error', 5000, 'window', windowId);
  }

  (event.target as HTMLParagraphElement).scrollLeft = 0;
}
</script>

<template>
  <div class="notepad-header">
    <p class="file-name" contenteditable="true" @input="onInput($event as InputEvent)" @blur="onBlur($event as FocusEvent)">{{ fileName }}</p>
    <div class="buttons">
      <button class="save-edits-button button" @click="emit('onSaveChanges')">save changes</button>
    </div>
  </div>
</template>

<style scoped>
.notepad-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  padding: 10px;
  width: 100%;
  height: 50px;
  background-color: var(--taskbar-background-color);
  color: var(--text-color);
}

.file-name {
  font-size: var(--font-size-elg);
  background-color: var(--input-primary-color);
  padding-inline: 10px;
  padding-block: 3px;
  border-radius: 2px;
  width: 300px;
  text-wrap: nowrap;
  overflow-x: hidden;
}

.file-name:focus {
  overflow-x: auto;
}

.button {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--button-primary-color);
  border: var(--input-border-color) 2px solid;
  border-radius: 2px;
  color: var(--text-color);
  padding-block: 5px;
  padding-inline: 10px;
}

.buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.button:hover {
  border-color: var(--button-hover-color);
  background-color: var(--button-hover-color);
}
</style>
