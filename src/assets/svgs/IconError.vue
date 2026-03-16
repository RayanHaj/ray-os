<template>
  <svg
    :width="customWidth"
    :height="customHeight"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
  >
    <path
      :fill="customColor"
      fill-rule="evenodd"
      d="M8 14.5a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13ZM8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Zm1-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0Zm-.25-6.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5Z"
      clip-rule="evenodd"
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
