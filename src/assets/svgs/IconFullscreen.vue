<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    aria-hidden="true"
    role="img"
    :style="{color: customColor, opacity: 1, transform: 'rotate(0deg)'}"
    :width="customWidth"
    :height="customHeight"
    viewBox="0 0 24 24"
  >
    <path
      fill="none"
      :stroke="customColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.5"
      d="M17 3c.464 0 .697 0 .892.022a3.5 3.5 0 0 1 3.086 3.086C21 6.303 21 6.536 21 7m-4 14c.464 0 .697 0 .892-.022a3.5 3.5 0 0 0 3.086-3.086C21 17.697 21 17.464 21 17M7 3c-.464 0-.697 0-.892.022a3.5 3.5 0 0 0-3.086 3.086C3 6.303 3 6.536 3 7m4 14c-.464 0-.697 0-.892-.022a3.5 3.5 0 0 1-3.086-3.086C3 17.697 3 17.464 3 17"
    ></path>
  </svg>
</template>
<script setup lang="ts">
defineProps({
  customWidth: { type: Number, required: false, default: 20 },
  customHeight: { type: Number, required: false, default: 20 },
  customColor: { type: String, required: false, default: 'var(--svg-color)' },
});
</script>
