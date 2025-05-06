<script setup lang="ts">
import SettingsSidebar from '@/components/applications/settings/SettingsSidebar.vue';
import SettingsThemes from '@/components/applications/settings/SettingsThemes.vue';
import { ref } from 'vue';

const selectedOption = ref('themes');
</script>

<template>
  <div class="settings">
    <SettingsSidebar @selected-option="selectedOption = $event" />
    <div class="selected-setting-window">
      <h1>{{ selectedOption }}</h1>
      <SettingsThemes v-show="selectedOption === 'themes'" />
    </div>
  </div>
</template>

<style scoped>
.settings {
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;
  height: calc(100% - 30px);
  color: var(--text-color);
}
.selected-setting-window {
  display: flex;
  gap: 15px;
  flex-direction: column;
}
</style>
