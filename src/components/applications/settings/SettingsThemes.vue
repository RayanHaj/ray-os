<script setup lang="ts">
import { onMounted, ref } from 'vue';
import themes from '@/json/themes.json';
import { useThemeSwitcher } from '@/composables/useThemeSwitcher.ts';

const selectedTheme = ref(Object.keys(themes)[0]);

onMounted(() => {
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme) {
    selectedTheme.value = currentTheme;
  }
});
</script>

<template>
  <div class="settings-themes">
    <select v-model="selectedTheme" @change="useThemeSwitcher().setTheme(selectedTheme)">
      <option v-for="theme of Object.keys(themes)" :key="theme" :value="theme">{{ theme }}</option>
    </select>
  </div>
</template>
