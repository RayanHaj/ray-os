<script setup lang="ts">
import { ref } from 'vue';

defineProps({
  title: {
    required: true,
    type: String,
  },
});

const input = ref('');
defineEmits(['modalEvent:submitClick', 'modalEvent:cancelClick']);
</script>

<template>
  <div class="modal">
    <h2>{{ title }}</h2>

    <div class="input-handler">
      <input type="text" v-model="input" />
      <button @click="$emit('modalEvent:submitClick', input)">submit</button>
    </div>

    <button @click="$emit('modalEvent:cancelClick')">cancel</button>
  </div>
</template>

<style scoped>
.modal {
  color: white;
  position: absolute;
  right: 0;
  width: 300px;
  height: 200px;
  background: var(--tabs-background);
  border: var(--window-border-color) solid 2px;
  padding: 10px;
  z-index: 9999;
}
.input-handler {
  display: flex;
  flex-direction: row;
}
</style>
