<script setup lang="ts">
import { useSereneSoundsStore } from '@/stores/sereneSounds.ts';
import SoundCardsCategory from '@/components/applications/sereneSounds/collection/SoundCardsCategory.vue';
import { onBeforeMount, ref } from 'vue';
import { useGetCategoriesFromSounds } from '@/composables/useGetCategoriesFromSounds.ts';
import type { AllowedSoundCategories } from '@/types/AllowedSoundCategories.ts';

const sereneSoundsStore = useSereneSoundsStore();
const categories = ref<AllowedSoundCategories[]>(
  useGetCategoriesFromSounds(sereneSoundsStore.sounds),
);
onBeforeMount(() => {
  categories.value = useGetCategoriesFromSounds(sereneSoundsStore.sounds);
});
</script>

<template>
  <div class="serene-sounds-collection">
    <SoundCardsCategory v-for="category of categories" :key="category" :category="category" />
  </div>
</template>

<style scoped>
.serene-sounds-collection {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 10px;
  gap: 15px;
  height: calc(100% - 50px);
  overflow-y: auto;
}
</style>
