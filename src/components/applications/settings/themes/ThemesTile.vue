<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useThemeColors } from '@/composables/theme/useThemeColors.ts';
import { type Theme, type ThemeProperty } from '@/types/themeTypes.ts';

const { themeName, isSelected } = defineProps<{ themeName: Theme; isSelected: boolean }>();

const initialThemeProperties = [
  '--background-color',
  '--input-primary-color',
  '--button-primary-color',
  '--accent-color',
];

const textThemeColor = useThemeColors().getThemeColor(themeName, '--text-color');
const themeColors = ref<(string | ThemeProperty)[]>(initialThemeProperties);

onBeforeMount(() => {
  themeColors.value.forEach(
    (themeColor, index) =>
      (themeColors.value[index] = useThemeColors().getThemeColor(
        themeName,
        themeColor as ThemeProperty,
      )),
  );
});

const emits = defineEmits(['selectTheme']);
</script>
<template>
  <div :class="{ selected: isSelected }" @click="emits('selectTheme')">
    <span v-for="color in themeColors" :key="color" :style="{ backgroundColor: color }" />
    <p :style="{ color: textThemeColor }">{{ themeName }}</p>
  </div>
</template>
<style scoped>
div {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 200px;
  overflow: hidden;
  border-radius: 5px;
}
div.selected {
  border: var(--input-border-color) 2px solid;
}
div p {
  position: absolute;
  background-color: rgba(0, 0, 0, 1);
  padding: 10px;
  width: 100%;
  text-align: center;
  font-size: var(--font-size-elg);
}

div span {
  width: 25%;
  height: 100%;
}
</style>
