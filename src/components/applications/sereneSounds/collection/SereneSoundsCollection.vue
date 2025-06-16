<script setup lang="ts">
import type { PropType } from 'vue';

defineProps({
  collection: Array as PropType<{
    type: 'water',
    name: string,
    soundUrl: string
  }[]>
});
</script>

<template>
  <div class="serene-sounds-collection">
    
  </div>
</template>

<style scoped>

</style>
