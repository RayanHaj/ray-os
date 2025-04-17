import { onMounted, onUnmounted, ref } from 'vue'
export function useBrowserWindowSize() {
  const width = ref(0);
  const height = ref(0);

  updateSizes();

  onMounted(() => {
    window.addEventListener('resize', updateSizes);
  });
  onUnmounted(() => window.removeEventListener('resize', updateSizes));

  function updateSizes() {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  }

  return { width: width, height: height }
}
