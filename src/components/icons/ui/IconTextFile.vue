<template>
  <svg
    :width="customWidth"
    :height="customHeight"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
  >
    <path
      :fill="customColor"
      d="m213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66ZM160 51.31L188.69 80H160ZM200 216H56V40h88v48a8 8 0 0 0 8 8h48v120Zm-32-80a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8Zm0 32a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8Z"
    />
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

