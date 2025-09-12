import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Category } from '@/types/TodoTypes.ts';

export const useTodoStore = defineStore('todo', () => {
  const selectedCategory = ref<Category>();
  return { selectedCategory }
});
