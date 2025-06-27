<script setup lang="ts">
import { type PropType, ref } from 'vue';
import { useGetBackgroundColorBySoundCategory } from '@/composables/useGetBackgroundColorBySoundCategory.ts';
import type { AllowedSoundCategories } from '@/types/AllowedSoundCategories.ts';
import type { Sounds } from '@/types/Sounds.ts';
import { useFilterSoundsByCategory } from '@/composables/useFilterSoundsByCategory.ts';
import { useSereneSoundsStore } from '@/stores/sereneSounds.ts';
import type { AllowedSoundNames } from '@/types/AllowedSoundNames.ts';
import SoundCard from '@/components/applications/sereneSounds/collection/SoundCard.vue';

const props = defineProps({
  category: { type: String as PropType<AllowedSoundCategories>, required: true },
});

const sereneSoundsStore = useSereneSoundsStore();

const filteredSounds = ref<Sounds>(
  useFilterSoundsByCategory(sereneSoundsStore.sounds, props.category),
);
const color = useGetBackgroundColorBySoundCategory(props.category);
</script>

<template>
  <div
    class="sound-card-category"
    :style="{ backgroundColor: color.background, color: color.font }"
  >
    <div class="label-wrapper">
      <h3>{{ category }}</h3>
    </div>
    <div class="sounds">
      <SoundCard
        v-for="[soundName, properties] of Object.entries(filteredSounds)"
        :key="soundName"
        :sound="{ name: soundName as AllowedSoundNames, category: properties.category }"
      />
    </div>
  </div>
</template>

<style scoped>
.sound-card-category {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  gap: 10px;
  border-radius: 10px;
  width: 270px;
  height: 270px;
}
.label-wrapper {
  background-color: rgba(0, 0, 0, 0.4);
  padding: 5px;
  padding-inline: 15px;
  align-self: start;
  border-radius: 5px;
}
.sounds {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
