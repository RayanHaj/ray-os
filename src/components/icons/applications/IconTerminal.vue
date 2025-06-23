<template>
  <svg
    :width="customWidth"
    :height="customHeight"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
  >
    <mask id="ipSTerminal0">
      <g fill="none" stroke-linejoin="round" stroke-width="4">
        <rect width="40" height="32" x="4" y="8" fill="#fff" stroke="#fff" rx="2" />
        <path stroke="#000" stroke-linecap="round" d="m12 18l7 6l-7 6m11 2h13" />
      </g>
    </mask>
    <path :fill="customColor" d="M0 0h48v48H0z" mask="url(#ipSTerminal0)" />
  </svg>
</template>
<script setup lang="ts">
defineProps({
  customWidth: {
    category: Number,
    required: false,
    default: 20,
  },
  customHeight: {
    category: Number,
    required: false,
    default: 20,
  },
  customColor: {
    category: String,
    required: false,
    default: 'var(--svg-color)',
  },
});
</script>
