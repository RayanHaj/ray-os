<script setup lang="ts">
import { itemTypes } from '@/types/ItemTypes.ts';
import StartMenuTag from '@/components/startMenu/StartMenuTag.vue';
</script>
<template>
  <div class="start-menu-tags">
    <div v-for="itemType in itemTypes" :key="itemType">
      <StartMenuTag :tagValue="itemType" />
    </div>
  </div>
</template>
<style scoped>
.start-menu-tags {
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;
}
</style>
