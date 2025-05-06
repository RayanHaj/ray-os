import { ref, onMounted, onUnmounted } from 'vue';

export function useDateTime() {
  const time = ref('');
  let timeoutId: number;

  const updateTime = () => {
    const now = new Date();
    time.value = formatTime(now);

    const delay = 1000 - now.getMilliseconds();
    timeoutId = setTimeout(updateTime, delay);
  };

  const formatTime = (date: Date): string => {
    return `${String(date.getHours()).padStart(2, '0')}:` +
      `${String(date.getMinutes()).padStart(2, '0')}:` +
      `${String(date.getSeconds()).padStart(2, '0')}`;
  };

  onMounted(() => {
    updateTime();
  });

  onUnmounted(() => {
    clearTimeout(timeoutId);
  });

  return { time };
}
