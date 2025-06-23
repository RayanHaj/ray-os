<template>
  <svg
    :width="customWidth"
    :height="customHeight"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
  >
    <path
      :fill="customColor"
      d="M8.75 5.5A1.75 1.75 0 0 0 7 7.25v9.5a1.75 1.75 0 1 0 3.5 0v-9.5A1.75 1.75 0 0 0 8.75 5.5m6.5 0a1.75 1.75 0 0 0-1.75 1.75v9.5a1.75 1.75 0 1 0 3.5 0v-9.5a1.75 1.75 0 0 0-1.75-1.75"
    />
  </svg>
</template>
<script setup lang="ts">
defineProps({
  customWidth: { category: Number, required: false, default: 20 },
  customHeight: { category: Number, required: false, default: 20 },
  customColor: { category: String, required: false, default: 'var(--svg-color)' },
});
</script>
