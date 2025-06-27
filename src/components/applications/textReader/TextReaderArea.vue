<script setup lang="ts">
const props = defineProps({ text: { required: false, type: () => String, default: '' } });
</script>

<template>
  <div contenteditable="true" class="text-reader-area">
    <p>{{ text }}</p>
  </div>
</template>

<style scoped></style>
