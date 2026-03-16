<template>
  <svg
    :width="customWidth"
    :height="customHeight"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1024 1024"
  >
    <path
      :fill="customColor"
      d="M512 64a448 448 0 1 1 0 896a448 448 0 0 1 0-896zm0 832a384 384 0 0 0 0-768a384 384 0 0 0 0 768zm48-176a48 48 0 1 1-96 0a48 48 0 0 1 96 0zm-48-464a32 32 0 0 1 32 32v288a32 32 0 0 1-64 0V288a32 32 0 0 1 32-32z"
    />
  </svg>
</template>
<script setup lang="ts">
defineProps({
  customWidth: { type: Number, required: false, default: 20 },
  customHeight: { type: Number, required: false, default: 20 },
  customColor: { type: String, required: false, default: 'var(--svg-color)' },
});
</script>
