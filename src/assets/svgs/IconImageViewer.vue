<template>
  <svg
    :width="customWidth"
    :height="customHeight"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :fill="customColor"
  >
    <g fill="none" :stroke="customColor" stroke-linejoin="round">
      <path stroke-linecap="round" d="M7 21a2 2 0 0 1-2-2V3h9l5 5v11a2 2 0 0 1-2 2H7Z" />
      <path stroke-linecap="round" d="m6 20l6-6l6 6" />
      <path stroke-width="1.5" d="M9.5 10.5h.01v.01H9.5z" />
      <path d="M13 3v6h6" />
    </g>
  </svg>
</template>

<script setup lang="ts">
defineProps({
  customWidth: { type: Number, required: false, default: 20 },
  customHeight: { type: Number, required: false, default: 20 },
  customColor: { type: String, required: false, default: 'var(--svg-color)' },
});
</script>
