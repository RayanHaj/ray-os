<script setup lang="ts">
import { useDateTime } from '@/composables/helpers/UseDateTime.ts';
import { type Ref, ref } from 'vue';

const { time } = useDateTime();

const soundProcess: Ref<'Audio Player' | 'None'> = ref('None');
</script>

<template>
  <div class="time-process-wrapper" :class="soundProcess ? 'show-background-color' : ''">
    {{ time }}
  </div>
</template>

<style scoped>
.time-process-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: var(--font-size-elg);
  font-family: 'Courier New', sans-serif;
  align-items: end;
  padding: 6px;
  padding-inline: 10px;
  width: fit-content;
  border-radius: 5px;
}

.show-background-color {
  background-color: var(--button-secondary-color);
}
</style>
