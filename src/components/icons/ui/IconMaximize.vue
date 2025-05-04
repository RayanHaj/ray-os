<template>
  <svg :width="customWidth + 2" :height="customHeight + 2"
       xmlns="http://www.w3.org/2000/svg"
       viewBox="0 0 16 13">
    <path
      :fill="customColor" fill-rule="evenodd"
      d="M4.5 3A1.5 1.5 0 0 0 3 4.5v7A1.5 1.5 0 0 0 4.5 13h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 11.5 3h-7ZM5 4.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V5a.5.5 0 0 1 .5-.5Z"
    />
  </svg>
</template>
<script setup lang="ts">
defineProps({
  customWidth: {
    type: Number,
    required: false,
    default: 20,
  },
  customHeight: {
    type: Number,
    required: false,
    default: 20,
  },
  customColor: {
    type: String,
    required: false,
    default: 'var(--svg-color)',
  },
})
</script>
