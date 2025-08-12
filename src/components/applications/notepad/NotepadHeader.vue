<script setup lang="ts">
const { fileName } = defineProps<{ fileName: string }>();
const emit = defineEmits(['onSaveChanges']);
</script>

<template>
  <div class="notepad-header">
    <p class="file-name">{{ fileName }}</p>
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
  padding-block: 5px;
  border-radius: 2px;
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
