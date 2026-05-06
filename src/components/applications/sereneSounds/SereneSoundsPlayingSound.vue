<script setup lang="ts">
import { onBeforeMount, ref, shallowRef, watch } from 'vue';
import { useSvgByFileNameAndDirectory } from '@/composables/svg/useSvgByFileNameAndDirectory.ts';
import { useSereneSoundsStore } from '@/stores/sereneSounds.ts';
import type { AllowedSoundNames } from '@/types/SereneSoundsTypes.ts';
import { useAudioPlayerStore } from '@/stores/audioPlayer.ts';

const SereneSoundsAudios = ref<AllowedSoundNames[]>([]);
const playSvg = shallowRef();
const pauseSvg = shallowRef();
const playing = ref(false);

const sereneSoundsStore = useSereneSoundsStore();
const audioPlayerStore = useAudioPlayerStore();

onBeforeMount(async () => {
  playSvg.value = await useSvgByFileNameAndDirectory('Play');
  pauseSvg.value = await useSvgByFileNameAndDirectory('Pause');
});

const { soundProcess } = defineProps<{ soundProcess: 'Serene Sounds' | 'Audio Player' | 'None'}>();

watch(
  () => sereneSoundsStore.playingSounds,
  (newVal, oldVal) => {
    if (newVal.length > 0) {
      SereneSoundsAudios.value = newVal;
      playing.value = true;
    } else {
      SereneSoundsAudios.value = oldVal;
      playing.value = false;
    }
  },
);

watch(
  () => audioPlayerStore.audioElementCount,
  (newVal) => {
    playing.value = newVal > 0;
  },
);

async function onPlay() {
  if (soundProcess === 'Serene Sounds') {
    playing.value = !playing.value;
    if (playing.value) {
      for (const sound of SereneSoundsAudios.value) {
        await sereneSoundsStore.playSound(sound);
      }
    } else {
      sereneSoundsStore.pauseAllSounds();
    }
  } else if (soundProcess === 'Audio Player') {
    playing.value = !playing.value;
    if (playing.value) {
      audioPlayerStore.playAll();
    } else {
      audioPlayerStore.pauseAll();
    }
  }
}

function getSoundName() {
  if (soundProcess === 'Serene Sounds') {
    return SereneSoundsAudios.value.length > 1 ? 'multiple' : SereneSoundsAudios.value[0];
  } else if (soundProcess === 'Audio Player') {
    return audioPlayerStore.audioElementCount > 1
      ? 'multiple'
      : (audioPlayerStore.getAudioFileName() ?? 'audio file');
  }
}
</script>

<template>
  <div class="serene-sounds-playing-sound">
    <h4 class="sound-name">
      {{ getSoundName() }}
    </h4>
    <button class="play-button" @click="onPlay">
      <component :is="playing ? pauseSvg : playSvg" :custom-width="15" :custom-height="15" />
    </button>
  </div>
</template>

<style scoped>
.serene-sounds-playing-sound {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 230px;
  height: 30px;
  background-color: var(--button-primary-color);
  border-radius: 10px;
  padding-left: 10px;
  padding-right: 10px;
}

.sound-name {
  font-size: var(--font-size-lg);
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

@media (max-width: 1000px) {
  .serene-sounds-playing-sound {
    width: 150px;
  }
}

@media (max-width: 600px) {
  .serene-sounds-playing-sound {
    width: 130px;
  }
}
</style>
