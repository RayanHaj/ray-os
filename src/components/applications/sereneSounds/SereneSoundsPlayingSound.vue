<script setup lang="ts">
import { onBeforeMount, ref, shallowRef } from 'vue';
import { useSvgByFileNameAndDirectory } from '@/composables/useSvgByFileNameAndDirectory.ts';

  const sound = ref('rain');
  const playSvg = shallowRef();
  const pauseSvg = shallowRef();
  const playing = ref(false);

  onBeforeMount(async () => {
    playSvg.value = await useSvgByFileNameAndDirectory('ui', 'Play');
    pauseSvg.value = await useSvgByFileNameAndDirectory('ui', 'Pause');
  });
</script>

<template>
  <div class="serene-sounds-playing-sound">
    <h4 class="sound-name">{{ sound }}</h4>
    <button class="play-button" @click="playing = !playing">
      <component :is="playing ? pauseSvg : playSvg" :custom-width="15" :custom-height="15"/>
    </button>
  </div>
</template>

<style scoped>
  .serene-sounds-playing-sound {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 150px;
    height: 30px;
    background-color: var(--button-primary-color);
    border-radius: 10px;
    padding-left: 10px;
    padding-right: 10px;
  }
  .sound-name {
    color: var(--text-color);
  }
  .play-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: var(--button-secondary-color);
    border: none;
  }

  .play-button:hover {
    background-color: var(--button-hover-color);
  }
</style>
