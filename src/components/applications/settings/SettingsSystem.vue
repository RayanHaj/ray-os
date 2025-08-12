<script setup lang="ts">
import UiDropdown from '@/ui/UiDropdown.vue';
</script>

<template>
  <div class="settings-system">
    <UiDropdown
      @change="($event.target as HTMLSelectElement).value ?? null"
      :style="{ width: '100%' }"
    >
      <option
        v-for="option of ['option 1', 'option 2', 'option 3']"
        :key="option"
        :selected="option === 'option 2'"
      >
        {{ option }}
      </option>
    </UiDropdown>
  </div>
</template>

<style scoped></style>
