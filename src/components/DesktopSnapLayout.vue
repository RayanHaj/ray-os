<script setup lang="ts">
import { computed, type PropType, ref, watch } from 'vue';

const props = defineProps({
  showSnapLayout: {
    required: true,
    type: Object as PropType<{ show: boolean; windowId: string }>,
  },
});

const emits = defineEmits(['selectedLayout']);
const showLayoutAndHidePreview = ref(false);

const selectedLayout = ref('');
function onMouseOver(element: EventTarget | null) {
  if (!(element instanceof HTMLDivElement)) return;

  const classList = element.classList;
  if (classList.contains('layout-option')) {
    if (classList.contains('left')) {
      selectedLayout.value = 'left';
    } else if (classList.contains('right')) {
      selectedLayout.value = 'right';
    } else if (classList.contains('top-left')) {
      selectedLayout.value = 'top-left';
    } else if (classList.contains('top-right')) {
      selectedLayout.value = 'top-right';
    } else if (classList.contains('bottom-left')) {
      selectedLayout.value = 'bottom-left';
    } else if (classList.contains('bottom-right')) {
      selectedLayout.value = 'bottom-right';
    } else {
      selectedLayout.value = '';
    }
  } else {
    selectedLayout.value = '';
  }
}

watch(
  () => props.showSnapLayout,
  (newValue) => {
    if (!selectedLayout.value) return;
    if (newValue.show) return;

    emits('selectedLayout', {
      layout: selectedLayout.value,
      windowId: props.showSnapLayout.windowId,
    });
    selectedLayout.value = '';
  },
);

const showBeam = computed(() => props.showSnapLayout.show && !showLayoutAndHidePreview.value);
</script>

<template>
  <transition name="slide">
    <hr v-if="showBeam" class="preview-beam" @mouseenter="showLayoutAndHidePreview = true" />
  </transition>
  <transition name="slide">
    <div
      v-if="!showBeam && props.showSnapLayout.show"
      class="snap-layout border-radius-bottom-left border-radius-bottom-right"
      @mouseleave="showLayoutAndHidePreview = false"
      @mouseover="onMouseOver($event.target)"
    >
      <div class="half-layout">
        <div class="layout-option left border-radius-bottom-left border-radius-top-left" />
        <div class="layout-option right border-radius-bottom-right border-radius-top-right" />
      </div>
      <div class="quarter-layout">
        <div class="layout-option top-left border-radius-top-left" />
        <div class="layout-option top-right border-radius-top-right" />
        <div class="layout-option bottom-left border-radius-bottom-left" />
        <div class="layout-option bottom-right border-radius-bottom-right" />
      </div>
    </div>
  </transition>
</template>

<style scoped>
.snap-layout {
  display: flex;
  flex-direction: row;
  width: 500px;
  padding: 10px;
  gap: 10px;
  height: 150px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  background-color: var(--accent-color);
  z-index: 9999;
}

.preview-beam {
  width: 500px;
  position: absolute;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  background-color: var(--accent-color);
  z-index: 9999;
  height: 15px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  border: none;
}

.half-layout {
  display: flex;
  flex-direction: row;
  width: 200px;
  height: 100%;
  padding: 10px;
  background-color: var(--window-primary-color);
  gap: 10px;
}

.left,
.right {
  width: 100px;
  height: 100%;
  background-color: var(--window-secondary-color);
}

.quarter-layout {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 10px;
  width: 250px;
  height: 100%;
  flex: 2;
  flex-wrap: wrap;
  background-color: var(--window-primary-color);
  gap: 10px;
}

.top-left,
.top-right,
.bottom-left,
.bottom-right {
  width: 120px;
  height: 50px;
  background-color: var(--window-secondary-color);
}

.top-left:hover,
.top-right:hover,
.bottom-left:hover,
.bottom-right:hover,
.left:hover,
.right:hover {
  background-color: var(--accent-color);
}

.half-layout,
.quarter-layout {
  border-radius: 10px;
}

.border-radius-bottom-left {
  border-bottom-left-radius: 10px;
}

.border-radius-bottom-right {
  border-bottom-right-radius: 10px;
}

.border-radius-top-left {
  border-top-left-radius: 10px;
}

.border-radius-top-right {
  border-top-right-radius: 10px;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateY(0);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
</style>
