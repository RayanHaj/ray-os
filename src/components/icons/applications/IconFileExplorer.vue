<template>
  <svg
    :width="customWidth"
    :height="customHeight"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="240 240 330 330"
  >
    <defs>
      <clipPath id="e5a7685bf2">
        <path
          :fill="customColor"
          fill-rule="evenodd"
          d="M 243 275.398438 L 567 275.398438 L 567 534.898438 L 243 534.898438 Z M 243 275.398438 "
        />
      </clipPath>
    </defs>
    <g clip-path="url(#e5a7685bf2)">
      <path
        :fill="customColor"
        fill-rule="evenodd"
        d="M 372.601562 275.398438 L 275.402344 275.398438 C 257.5 275.398438 243.164062 289.914062 243.164062 307.835938 L 243.003906 502.460938 C 243.003906 520.382812 257.5 534.898438 275.402344 534.898438 L 534.597656 534.898438 C 552.5 534.898438 566.996094 520.382812 566.996094 502.460938 L 566.996094 340.273438 C 566.996094 322.351562 552.5 307.835938 534.597656 307.835938 L 405 307.835938 Z M 372.601562 275.398438 "
      />
    </g>
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
});
</script>
