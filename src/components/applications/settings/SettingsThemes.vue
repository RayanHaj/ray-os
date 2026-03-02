<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import themes from '@/json/themes.json';
import UiDropdown from '@/ui/UiDropdown.vue';
import { useThemeSwitcher } from '@/composables/helpers/useThemeSwitcher.ts';

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
      @change="useThemeSwitcher().setTheme(($event.target as HTMLSelectElement).value)"
      :style="{ width: '100%' }"
    >
      <option v-for="theme of Object.keys(themes)" :key="theme" :selected="selectedTheme === theme">
        {{ theme }}
      </option>
    </UiDropdown>
  </div>
</template>

