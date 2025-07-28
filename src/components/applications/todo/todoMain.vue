<script setup lang="ts">
import TodoCard from '@/components/applications/todo/todoCard.vue';
import { onBeforeMount, ref } from 'vue';
import { useToastStore } from '@/stores/toast.ts';

const todos = ref<Array<{ task: string; done: boolean }>>([{ task: 'eating bread', done: false }]);

const todosLocalStorageKey = 'todos';
onBeforeMount(() => {
  const localStorageTodos = localStorage.getItem(todosLocalStorageKey);
  if (localStorageTodos) {
    try {
      const jsonParsedTodos = JSON.parse(localStorageTodos);
      if (jsonParsedTodos) {
        todos.value.push(jsonParsedTodos);
      }
    } catch (e) {
      console.error(e as Error);
      useToastStore().createToast(
        `could not fetch todos from the browser storage, try restarting the application`,
        'error',
        5000,
      );
    }
  }
});
</script>

<template>
  <div class="todo">
    <todo-card v-for="(todo, index) in todos" :key="`${todo}|${index}`" :todo="todo" />
  </div>
</template>

<style scoped></style>
