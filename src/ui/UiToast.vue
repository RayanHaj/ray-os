<script setup lang="ts">
import { useToastStore } from '@/stores/toast.ts';
import { useTaskbarStore } from '@/stores/taskbar.ts';
import { nextTick, ref, watch } from 'vue';
import { useSvgsStore } from '@/stores/svgs.ts';
import type { Toast } from '@/types/ToastTypes.ts';

const taskbarStore = useTaskbarStore();
const toastStore = useToastStore();
const toastHeight = ref(150);
const toastWidth = ref(350);

const { toastLocation, windowId } = defineProps<{
  toastLocation: 'window' | 'desktop';
  windowId?: string;
}>();

const toastRefs = ref<(HTMLElement | null)[]>([]);

const styles = ref<{ top: string; right: string; width?: string; height?: string }[]>([]);

function updateStyles(toasts: Toast[]) {
  let topValueToast = 0;

  styles.value = toasts.map((_, index) => {
    let width = toastRefs.value[index]?.clientWidth;
    let height = toastRefs.value[index]?.clientHeight;

    const previousToast = toastRefs.value[index - 1];
    if (index > 0 && previousToast) {
      topValueToast += previousToast.clientHeight + 10;
    }

    if (!width || !height) {
      width = toastWidth.value;
      height = toastHeight.value;

      if (toastLocation === 'desktop') {
        height = toastHeight.value + taskbarStore.taskbarHeight;
      }

      return {
        top: `calc((100% - ${height + topValueToast}px) - 1%)`,
        right: '1%',
        width: `${width}px`,
        height: `${height}px`,
      };
    }

    if (toastLocation === 'desktop') {
      height += taskbarStore.taskbarHeight;
    }

    return { top: `calc((100% - ${height + topValueToast}px) - 2%)`, right: '1%' };
  });
}

const showToasts = ref<boolean>(false);
watch(
  () => toastStore.toasts,
  async (newToasts) => {
    if (toastLocation === 'window' && !newToasts.some((toast) => toast.windowId === windowId)) {
      showToasts.value = false;
      return;
    }

    const filteredToasts = newToasts.filter((toast) => toast.location === toastLocation);
    if (filteredToasts.length === 0) {
      showToasts.value = false;
    } else {
      showToasts.value = true;

      await nextTick();
      updateStyles(filteredToasts);
    }
  },
  { immediate: true },
);

function handleCloseToast(index: number) {
  toastStore.closeToast(index);
}
</script>

<template>
  <div
    v-show="showToasts"
    :ref="
      (el) => {
        if (el) toastRefs[index] = el as HTMLElement;
      }
    "
    v-for="(toast, index) of toastStore.toasts"
    :key="`${index}-${toast.message}`"
    class="toast"
    :class="toast.type"
    :style="styles[index]"
  >
    <div class="close-toast">
      <button class="close-toast-button" @click="handleCloseToast(index)">
        <component
          class="close-svg"
          :is="useSvgsStore().svgs['Close']"
          :custom-height="15"
          :custom-width="15"
        ></component>
      </button>
    </div>
    <p class="message">{{ toast.message }}</p>
  </div>
</template>

<style scoped>
.toast {
  position: absolute;
  padding: 10px;
  border-radius: 5px;
  z-index: 9999;
  border: 2px solid;
  background: var(--button-primary-color);
  max-width: 400px;
  overflow-wrap: anywhere;
}

.toast.success {
  border-color: green;
}

.toast.warning {
  border-color: yellow;
}

.toast.error {
  border-color: red;
}

.message {
  color: var(--text-color);
  font-size: var(--font-size-lg);
}

.close-toast {
  display: flex;
  width: 100%;
  justify-content: end;
}

.close-toast-button {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 25px;
  width: 25px;
  padding: 5px;
  background: none;
  border-radius: 50%;
  border: none;
}

.close-toast-button:hover {
  background-color: var(--button-secondary-color);
}
</style>
