<script setup lang="ts">
import { type PropType } from 'vue'
  const props = defineProps({
    reference: {
      required: true,
      type: Object as PropType<{id: number, label: string, zIndex: number}>
    }
  });

  const constructedId = `${props.reference.label}[${props.reference.id}]`;
</script>

<template>
  <div class="window" :id="constructedId" :style="{zIndex: reference.zIndex}">
  </div>
</template>

<style scoped>
  .window {
    padding: 100px;
    background-color: red;
    position: absolute;
    right: 0;
  }
</style>
