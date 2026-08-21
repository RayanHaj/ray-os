<script setup lang="ts">
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { useConfirmDialogStore } from '@/stores/confirmDialog.ts';
import { computed } from 'vue';

const confirmDialogStore = useConfirmDialogStore();
const windowId = useInjectOrThrow<'string'>('windowId');

const confirmDialog = computed(() => confirmDialogStore.confirmDialogs[windowId]);
</script>
<template>
  <div class="confirm-dialog">
    <p>{{ confirmDialog.message }}</p>
    <div class="buttons">
      <button
        @click="
          confirmDialogStore.confirmDialogs[windowId] = {
            ...confirmDialogStore.confirmDialogs[windowId],
            confirmed: false,
          }
        "
      >
        Go back
      </button>
      <button
        @click="
          confirmDialogStore.confirmDialogs[windowId] = {
            ...confirmDialogStore.confirmDialogs[windowId],
            confirmed: true,
          }
        "
      >
        Exit
      </button>
    </div>
  </div>
</template>
<style scoped>
.confirm-dialog {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

p,
.buttons {
  display: flex;
  position: relative;
  height: 50%;
  width: 100%;
}

p {
  font-size: var(--font-size-elg);
  align-items: center;
  justify-content: center;
}

.buttons {
  flex-direction: row;
  align-items: flex-end;
  gap: 10px;
}

button {
  width: 50%;
  height: 30px;
  border-radius: 5px;
  background: var(--button-primary-color);
  border: var(--input-border-color) 2px solid;
}
</style>
