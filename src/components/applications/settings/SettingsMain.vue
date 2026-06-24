<script setup lang="ts">
import SettingsSidebar from '@/components/applications/settings/SettingsSidebar.vue';
import { onMounted, ref } from 'vue';
import { type AllowedSettingsOptions, settingsOptionsComponents } from '@/types/settingsTypes.js';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';

const selectedOption = ref<AllowedSettingsOptions>('Themes');

const settings = ref();
const isSmall = ref(false);
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    isSmall.value = entry.contentRect.width < 500;
  }
});

const windowId = useInjectOrThrow<string>('windowId');

onMounted(() => {
  resizeObserver.observe(settings.value);
});
</script>

<template>
  <div class="settings" ref="settings" :class="isSmall ? 'small' : undefined">
    <SettingsSidebar
      @option-selected="selectedOption = $event"
      :class="isSmall ? 'small' : undefined"
    />
    <div class="selected-setting-window">
      <div class="option-name">
        <h1>{{ selectedOption }}</h1>
        <hr />
      </div>
      <div class="current-option-settings">
        <div class="inner">
          <component :is="settingsOptionsComponents[selectedOption]" :window-id="windowId" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings {
  display: flex;
  flex-direction: row;
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
  border-radius: 5px;
}

.current-option-settings {
  align-self: center;
  width: 98%;
  height: 100%;
  background-color: var(--window-secondary-color);
  border: var(--input-border-color) 1px solid;
  border-bottom: none;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  overflow: hidden;
}

.inner {
  height: 100%;
  overflow: auto;
  padding: 10px;
}

.settings.small {
  overflow: auto;
  flex-direction: column;
}

.sidebar.small {
  align-items: center;
}
</style>
