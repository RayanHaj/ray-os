<template>
  <svg
    :width="customWidth"
    :height="customHeight"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
  >
    <g fill="none">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12zm9-3a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0V9zm4 0a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0V9z"
        :fill="customColor"
      />
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
