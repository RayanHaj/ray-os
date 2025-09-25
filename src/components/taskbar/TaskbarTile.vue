<script setup lang="ts">
import { useWindowStore } from '@/stores/window.ts';
import { computed, nextTick, onBeforeMount, ref, watch } from 'vue';
import type { Item } from '@/types/ItemTypes.ts';
import TaskbarTabs from '@/components/taskbar/TaskbarTabs.vue';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { useFileStore } from '@/stores/file.ts';
import { useBrowserStore } from '@/stores/browser.ts';

const fileStore = useFileStore();
const isHoveringOnTile = ref(false);

const { id } = defineProps<{ id: number }>();

const application = ref<Item | null>(null);
onBeforeMount(() => {
  application.value = fileStore.applications.find((item) => item.id === id) ?? null;
});

const windowStore = useWindowStore();
const getUnderlineClass = computed(() => {
  if (!application.value) {
    return 'underline hidden';
  }

  if (!windowStore.openWindowsReferences[application.value.label]) {
    return 'underline hidden';
  }

  const openWindowsReferenceCount =
    windowStore.openWindowsReferences[application.value.label].length;

  const minimizedCount = windowStore.openWindowsReferences[application.value.label].reduce(
    (accumulator, value) => (value.minimized ? accumulator + 1 : accumulator),
    0,
  );

  return minimizedCount === openWindowsReferenceCount
    ? 'underline minimized'
    : 'underline maximized';
});

function hasTabs() {
  if (!isHoveringOnTile.value || !application.value) {
    return false;
  }

  const reference = windowStore.openWindowsReferences[application.value.label];
  if (!reference || reference.length === 0) {
    return false;
  }

  return true;
}

const setClassOnHover = ref<string | null>(null);
const setTimeoutId = ref<number | null>(null);
const mouseOnTabs = ref(false);

function onMouseEnter(useDelay: boolean) {
  if (firstWindowOpenedOnClickTile.value) {
    firstWindowOpenedOnClickTile.value = false;
  }

  setClassOnHover.value = 'active';
  if (setTimeoutId.value) {
    clearTimeout(setTimeoutId.value);
    setTimeoutId.value = null;
  }

  if (useDelay) {
    setTimeoutId.value = setTimeout(() => {
      isHoveringOnTile.value = true;
    }, 500);
  } else {
    isHoveringOnTile.value = true;
  }
}

function onMouseLeave(useDelay: boolean) {
  if (firstWindowOpenedOnClickTile.value) {
    setClassOnHover.value = null;
  }

  if (setTimeoutId.value) {
    clearTimeout(setTimeoutId.value);
    setTimeoutId.value = null;
  }

  if (!hasTabs() || !useDelay) {
    setClassOnHover.value = null;
    isHoveringOnTile.value = false;
    return;
  }

  if (useDelay) {
    setTimeoutId.value = setTimeout(() => {
      setClassOnHover.value = null;
      isHoveringOnTile.value = false;
    }, 500);
  }
}

function onTabsUnmounted() {
  mouseOnTabs.value = false;
  isHoveringOnTile.value = false;
  setClassOnHover.value = null;
}

const firstWindowOpenedOnClickTile = ref(false);

function onClickTile() {
  if (!application.value) {
    return;
  }

  const reference = windowStore.openWindowsReferences[application.value.label];
  if (!reference || reference.length === 0) {
    windowStore.pushOpenWindowReference(application.value.label);
    firstWindowOpenedOnClickTile.value = true;
    return;
  }

  clearTimeout(setTimeoutId.value ?? undefined);
  isHoveringOnTile.value = false;

  nextTick().then(() => (setClassOnHover.value = 'active'));

  if (reference.length === 1) {
    windowStore.setWindowMinimized(
      windowStore.getGlobalId(application.value.label, reference[0].id),
    );
  }
}

const titleRef = ref();
const showTitle = computed(() => isHoveringOnTile.value && !hasTabs());
const titleIsOverflowing = ref<'positive' | 'negative' | ''>('');

watch(
  () => showTitle.value,
  async (value) => {
    if (!value) {
      titleIsOverflowing.value = '';
    }

    await nextTick();
    if (!titleRef.value) {
      return;
    }

    const rect = titleRef.value.getBoundingClientRect();

    if (rect.x + rect.width >= useBrowserStore().width) {
      titleIsOverflowing.value = 'positive';
    } else if (rect.x < 0) {
      titleIsOverflowing.value = 'negative';
    } else {
      titleIsOverflowing.value = '';
    }
  },
);

const getTitleOverflowStyle = computed(() => {
  if (titleIsOverflowing.value === 'positive') {
    return { right: 0 };
  } else if (titleIsOverflowing.value === 'negative') {
    return { left: 0 };
  }

  return '';
});
</script>

<template>
  <div
    v-if="application"
    class="application-name"
    :class="setClassOnHover"
    @mouseenter.prevent="onMouseEnter(true)"
    @mouseleave.prevent="onMouseLeave(true)"
    @contextmenu.prevent="onMouseEnter(false)"
  >
    <div ref="titleRef" v-if="showTitle" class="title-text-hover" :style="getTitleOverflowStyle">
      {{ application.label }}
    </div>
    <transition name="fade-shadow">
      <TaskbarTabs
        v-if="hasTabs() && firstWindowOpenedOnClickTile === false"
        :application-name="application.label"
        @mouse-entered="mouseOnTabs = true"
        @mouse-left="mouseOnTabs = false"
        @tabs-unmounted="onTabsUnmounted"
      />
    </transition>
    <div class="content" @click="onClickTile">
      <component class="app-svg" :is="useSvgOrFallback(application.label).svg" />
      <hr :class="getUnderlineClass" />
    </div>
  </div>
</template>

<style scoped>
.application-name {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.application-name.active {
  background-color: var(--button-hover-color);
  border-radius: 5px;
}

.title-text-hover {
  position: absolute;
  top: -50px;
  width: max-content;
  padding-block: 5px;
  padding-inline: 10px;
  background-color: var(--button-hover-color);
  border-radius: 5px;
  user-select: none;
}

hr {
  height: 5px;
  border: none;
  background-color: var(--svg-color);
  border-radius: 5px;
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

@media (max-width: 475px) {
  .app-svg {
    width: 20px;
    height: 20px;
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
