<script setup lang="ts">
import UiDropdown from '@/ui/UiDropdown.vue';

</script>

<template>
  <div class="settings-system">
    <UiDropdown
      class="desktop-tiles-adjustment-dropdown"
      :options="[
        'option 1',
        'option 2',
        'option 3'
      ]"
      :custom-styles-select="{
      width: '200px'
      }"
      @dropdown:value="console.log($event)"
    />
  </div>
</template>

<style scoped></style>
