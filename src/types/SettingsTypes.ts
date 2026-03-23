import type { Component } from 'vue';
import SettingsThemes from '@/components/applications/settings/SettingsThemes.vue';
import SettingsSystem from '@/components/applications/settings/SettingsSystem.vue';
import SettingsApplications from '@/components/applications/settings/SettingsApplications.vue';
import SettingsWallpapers from '@/components/applications/settings/wallpapers/SettingsWallpapers.vue';

export const allowedSettingsOptions = ['Themes', 'Wallpapers', 'System', 'Applications'] as const;
export type AllowedSettingsOptions = typeof allowedSettingsOptions[number];

export const settingsOptionsComponents: { [option in AllowedSettingsOptions]: Component } = {
  'Themes': SettingsThemes,
  'Wallpapers': SettingsWallpapers,
  'System': SettingsSystem,
  'Applications': SettingsApplications
}
