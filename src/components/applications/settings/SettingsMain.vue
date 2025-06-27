<script setup lang="ts">
import SettingsSidebar from '@/components/applications/settings/SettingsSidebar.vue';
import SettingsThemes from '@/components/applications/settings/SettingsThemes.vue';
import { onMounted, ref } from 'vue';
import type { AllowedSettingsOptions } from '@/types/SettingsTypes.ts';

const selectedOption = ref<AllowedSettingsOptions>('Themes');

const settings = ref();
const isSmall = ref(false);
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.contentRect.width < 500) {
      isSmall.value = true;
    } else {
      isSmall.value = false;
    }
  }
});

onMounted(() => {
  resizeObserver.observe(settings.value);
});
</script>

<template>
  <div class="settings" ref="settings" :class="isSmall ? 'small' : undefined">
    <SettingsSidebar
      @selected-option="selectedOption = $event"
      :class="isSmall ? 'small' : undefined"
    />
    <div class="selected-setting-window">
      <div class="option-name">
        <h1>{{ selectedOption }}</h1>
        <hr />
      </div>
      <div class="current-option-settings">
        <SettingsThemes v-show="selectedOption === 'Themes'" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 30px);
  color: var(--text-color);
}
.selected-setting-window {
  display: flex;
  gap: 15px;
  flex-direction: column;
  width: 100%;
}
.option-name {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-inline: 10px;
}
.option-name h1 {
  padding-inline: 5px;
}
hr {
  width: 100%;
  border: var(--window-border-color) solid 2px;
  border-radius: 10px;
}
.current-option-settings {
  padding-bottom: 100px;
  padding-inline: 15px;
  height: 100%;
}
.settings.small {
  flex-direction: column;
  overflow-y: auto;
}
.sidebar.small {
  align-items: center;
}
</style>
