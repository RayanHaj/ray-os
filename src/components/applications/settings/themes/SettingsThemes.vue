<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { type Theme, themes } from '@/types/themeTypes.ts';
import { useThemeSwitcher } from '@/composables/helpers/useThemeSwitcher.ts';
import ThemesTile from '@/components/applications/settings/themes/ThemesTile.vue';

const selectedTheme = ref(themes[0]);

onBeforeMount(() => {
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme) {
    selectedTheme.value = currentTheme as Theme;
  }
});

const selectTheme = (theme: Theme) => {
  useThemeSwitcher().setTheme(theme);
  selectedTheme.value = theme;
};
</script>

<template>
  <div class="settings-themes">
    <ThemesTile
      v-for="theme in themes"
      :key="theme"
      :theme-name="theme"
      :is-selected="theme === selectedTheme"
      @select-theme="selectTheme(theme)"
    />
  </div>
</template>

<style scoped>
  .settings-themes {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
    overflow-y: auto;
  }
</style>
