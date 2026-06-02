<script setup lang="ts">
const { title, value } = defineProps<{ title: string; value: string }>();
</script>
<template>
  <div class="file-properties-item">
    <label for="value"> {{ title }}: </label>
    <p id="value">{{ value }}</p>
  </div>
</template>
<style scoped>
.file-properties-item {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.file-properties-item label {
  font-size: var(--font-size-sm);
}

.file-properties-item p {
  color: var(--text-secondary-color);
  font-size: var(--font-size-sm);
  position: absolute;
  left: 100px;
}
</style>
