import { ref, onMounted, onUnmounted } from 'vue';

export function useDateTime() {
  const time = ref('');
  let timeoutId: number;

  const updateTime = () => {
    const now = new Date();
    time.value = now.toLocaleTimeString();

    const delay = 1000 - now.getMilliseconds();
    timeoutId = setTimeout(updateTime, delay);
  };

  onMounted(() => {
    updateTime();
  });

  onUnmounted(() => {
    clearTimeout(timeoutId);
  });

  return { time };
}
