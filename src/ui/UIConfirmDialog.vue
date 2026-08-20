<script setup lang="ts">
  const { message } = defineProps<{
    message?: string
  }>();

  const emit = defineEmits<{
  (e: 'onAction', proceed: boolean): void
  }>()
</script>
<template>
  <div>

  </div>
</template>
<style scoped>

</style>
