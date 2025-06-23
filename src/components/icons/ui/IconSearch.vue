<template>
  <svg
    :width="customWidth"
    :height="customHeight"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :fill="customColor"
    :style="{ paddingTop: '5px' }"
  >
    <path
      :fill="customColor"
      d="M12.5 12.5H20v5.885q0 .666-.475 1.14q-.474.475-1.14.475H12.5v-7.5Zm0-1V4h5.885q.666 0 1.14.475q.475.474.475 1.14V11.5h-7.5Zm-1 0H4V5.615q0-.666.475-1.14Q4.949 4 5.615 4H11.5v7.5Zm0 1V20H5.615q-.666 0-1.14-.475Q4 19.051 4 18.385V12.5h7.5Z"
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
