<script setup lang="ts">
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';

const rayDb = useInjectOrThrow<RayDb>('rayDb');
async function resetState() {
  const dbName = rayDb.db().name;
  rayDb.close();

  const dbDeleteRequest = window.indexedDB.deleteDatabase(dbName);
  dbDeleteRequest.onerror = (_) => {
    console.error('Error deleting database.');
  };

  dbDeleteRequest.onsuccess = (_) => {
    localStorage.clear();
    location.reload();
  };
}
</script>

<template>
  <div class="settings-system">
    <button class="reset-state-button" @click="resetState">Reset everything</button>
  </div>
</template>

<style scoped>
.reset-state-button {
  width: 100%;
  background: red;
  color: white;
  padding: 10px;
  border: none;
}
</style>
