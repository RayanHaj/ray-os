import type { Ref } from 'vue';

export function updateAudioDuration(audioDuration: Ref<number>, audioObject: Ref<HTMLAudioElement | null>) {
  audioDuration.value = audioObject.value?.duration ?? 0;
}

export function updateAudioTime(audioDuration: Ref<number>, audioObject: Ref<HTMLAudioElement | null>, audioCurrentTime: Ref<number>, audioLoop: Ref<boolean>) {
  audioCurrentTime.value = audioObject.value?.currentTime ?? 0;

  if (Math.floor(audioDuration.value) === Math.floor(audioCurrentTime.value) && audioObject.value) {
    if (audioLoop.value) {
      audioCurrentTime.value = 0;
      audioObject.value.currentTime = 0;
    }
    return;
  }
}
