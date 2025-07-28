<script setup lang="ts">
const { todo } = defineProps<{ todo: { task: string; done: boolean } }>();
</script>

<template>
  <div class="todo-card">
    {{ todo }}
  </div>
</template>

<style scoped></style>
