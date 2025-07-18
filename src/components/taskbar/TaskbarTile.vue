<script setup lang="ts">
import { useTaskbarStore } from '@/stores/taskbar.ts';
import { useWindowStore } from '@/stores/window.ts';
import { type Component, computed, onBeforeMount, ref, shallowRef } from 'vue';
import type { Item } from '@/types/ItemTypes.ts';
import TaskbarTabs from '@/components/taskbar/TaskbarTabs.vue';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';

const taskbarStore = useTaskbarStore();
const props = defineProps({ id: { required: true, type: Number } });

const isHoveringOnTile = ref(false);

const item = ref<Item>();
const svg = shallowRef<Component>();
onBeforeMount(() => {
  updateTile();
});

function updateTile() {
  item.value = taskbarStore.items.find((item) => item.content.id === props.id);

  if (item.value && item.value.content.type === 'application' && item.value.label !== '') {
    svg.value = useSvgOrFallback(item.value.label);
  }
}

const windowStore = useWindowStore();
const getUnderlineClass = computed(() => {
  if (!item.value) {
    return 'underline hidden';
  }

  if (!windowStore.openWindowsReferences[item.value.label]) {
    return 'underline hidden';
  }

  const openWindowsReferenceCount = windowStore.openWindowsReferences[item.value.label].length;
  const minimizedCount = windowStore.openWindowsReferences[item.value.label].reduce(
    (accumulator, value) => (value.minimized ? accumulator + 1 : accumulator),
    0,
  );

  if (minimizedCount === openWindowsReferenceCount) {
    return 'underline minimized';
  } else {
    return 'underline maximized';
  }
});

function hasTabs() {
  if (!isHoveringOnTile.value) {
    return false;
  }

  const reference = windowStore.openWindowsReferences[item.value ? item.value.label : ''];
  if (!reference || reference.length === 0) {
    return false;
  }

  return true;
}

const setClassOnHover = ref<string | null>(null);
const setTimeoutId = ref<number | null>(null);
const mouseOnTabs = ref(false);
function onMouseEnter() {
  if (firstWindowOpenedOnClickTile.value) {
    firstWindowOpenedOnClickTile.value = false;
  }

  setClassOnHover.value = 'active';
  if (setTimeoutId.value) {
    clearTimeout(setTimeoutId.value);
    setTimeoutId.value = null;
  }

  setTimeoutId.value = setTimeout(() => {
    isHoveringOnTile.value = true;
  }, 250);
}

function onMouseLeave() {
  if (firstWindowOpenedOnClickTile.value) {
    setClassOnHover.value = null;
  }

  if (setTimeoutId.value) {
    clearTimeout(setTimeoutId.value);
    setTimeoutId.value = null;
  }

  if (!hasTabs()) {
    setClassOnHover.value = null;
    isHoveringOnTile.value = false;
    return;
  }

  setTimeoutId.value = setTimeout(() => {
    setClassOnHover.value = null;
    isHoveringOnTile.value = false;
  }, 500);
}

function onTabsUnmounted() {
  mouseOnTabs.value = false;
  isHoveringOnTile.value = false;
  setClassOnHover.value = null;
}

const firstWindowOpenedOnClickTile = ref(false);
function onClickTile() {
  if (!item.value) {
    return;
  }

  windowStore.pushOpenWindowReference(item.value.label);
  firstWindowOpenedOnClickTile.value = true;
}
</script>

<template>
  <div
    class="tile"
    :class="setClassOnHover"
    @mouseenter.prevent="onMouseEnter"
    @mouseleave.prevent="onMouseLeave"
  >
    <transition name="fade-shadow">
      <TaskbarTabs
        v-if="hasTabs() && item && firstWindowOpenedOnClickTile === false"
        :application-name="item.label"
        @mouse-entered="mouseOnTabs = true"
        @mouse-left="mouseOnTabs = false"
        @tabs-unmounted="onTabsUnmounted"
      />
    </transition>
    <div class="content" @click="onClickTile">
      <component class="app-svg" v-if="svg" :is="svg" />
      <hr :class="getUnderlineClass" />
    </div>
  </div>
</template>

<style scoped>
.tile {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.tile.active {
  background-color: var(--button-hover-color);
  border-radius: 10px;
}

hr {
  height: 5px;
  border: none;
  background-color: var(--svg-color);
  border-radius: 50px;
  bottom: 2px;
  width: 66%;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  transition: width 0.2s;
}

.content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 10px;
}

.app-svg {
  width: 40px;
  height: 40px;
}

@media (max-width: 850px) {
  .app-svg {
    width: 30px;
    height: 30px;
  }
}

.underline.hidden {
  visibility: hidden;
}

.underline.maximized {
  width: 66%;
}

.underline.minimized {
  width: 40%;
}

.fade-shadow-enter-from,
.fade-shadow-leave-to {
  opacity: 0;
  transform: translateY(20px);
  box-shadow: none;
}

.fade-shadow-enter-to,
.fade-shadow-leave-from {
  opacity: 1;
  transform: translateY(0);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.fade-shadow-enter-active,
.fade-shadow-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease,
    box-shadow 0.3s ease;
}
</style>
