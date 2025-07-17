<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import themes from '@/json/themes.json';
import { useThemeSwitcher } from '@/composables/helpers/useThemeSwitcher.ts';
import UiDropdown from '@/ui/UiDropdown.vue';

const selectedTheme = ref(Object.keys(themes)[0]);

onBeforeMount(() => {
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme) {
    selectedTheme.value = currentTheme;
  }
});
</script>

<template>
  <div class="settings-themes">
    <UiDropdown
      class="theme-dropdown"
      :options="Object.keys(themes)"
      :default-value="selectedTheme"
      :custom-styles-select="{
      width: '200px'
      }"
      @dropdown:value="useThemeSwitcher().setTheme($event)"
    />
  </div>
</template>
