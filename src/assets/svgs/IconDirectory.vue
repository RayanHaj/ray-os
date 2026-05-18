<template>
  <svg
    :width="customWidth"
    :height="customHeight"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
  >
    <path
      fill="none"
      :stroke="customColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3 17V5h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"
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
