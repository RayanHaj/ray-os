<script setup lang="ts">
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import { useConfirmDialogStore } from '@/stores/confirmDialog.ts';

const { message } = defineProps<{ message?: string }>();

const confirmDialogStore = useConfirmDialogStore();
const windowId = useInjectOrThrow<'string'>('windowId');

</script>
<template>
  <div class="confirm-dialog">
    <p>{{ message }}</p>
    <div class="buttons">
      <button @click="confirmDialogStore.confirmDialogs[windowId] = true">Exit</button>
      <button @click="confirmDialogStore.confirmDialogs[windowId] = false">Cancel</button>
    </div>
  </div>
</template>
<style scoped></style>
