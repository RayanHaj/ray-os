import { type Ref, watch } from 'vue';
import type { TaskbarTileItem } from '@/types/taskbarTypes.ts';
import { type TaskbarPosition, useTaskbarStore } from '@/stores/taskbar.ts';

export function useWatchTaskbarProperties(taskbarItems: Ref<TaskbarTileItem[] | undefined>) {
  const taskbarStore = useTaskbarStore();

  watch(
    () => taskbarStore.items,
    (newItems) => (taskbarItems.value = newItems),
    { immediate: true },
  );

  watch(
    () => taskbarStore.taskbarPosition,
    (newPosition) => {
      const lsTaskbarPosition = localStorage.getItem('taskbarPosition');
      if (lsTaskbarPosition !== newPosition) {
        taskbarStore.setTaskbarPosition(lsTaskbarPosition as TaskbarPosition);
      }
    },
    { immediate: true },
  );
}
