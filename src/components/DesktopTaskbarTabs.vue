<script setup lang="ts">
  import { computed } from 'vue'
  import { useWindowStore } from '@/stores/window.ts'
  import DesktopTaskbarTab from '@/components/DesktopTaskbarTab.vue'

  const props = defineProps({
    applicationName: {
      required: true,
      type: String
    }
  });

  const windowStore = useWindowStore();
  const references = computed(() => {
    return windowStore.openWindowsReferences[props.applicationName];
  });
</script>

<template>
  <ol class="tabs">
    <DesktopTaskbarTab v-for="reference of references" :key="`${applicationName}-${reference.id}`" :window-reference="reference" :application-name="applicationName"/>
  </ol>
</template>

<style scoped>
  .tabs {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 5px;
    background-color: red;
    border-radius: 5px;
    bottom: 90px;
    padding: 20px;
    width: 200px;
    min-height: 200px;
    max-height: 300px;
    overflow: auto;
  }
</style>
