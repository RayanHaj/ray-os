<script setup lang="ts">
import { useWindowStore } from '@/stores/window.ts';
import { computed, nextTick, ref, watch } from 'vue';
import TaskbarTabs from '@/components/taskbar/TaskbarTabs.vue';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { useBrowserStore } from '@/stores/browser.ts';
import { useTaskbarStore } from '@/stores/taskbar.ts';
import type { TaskbarTileItem } from '@/types/taskbarTypes.ts';
import { useInitializeContextMenu } from '@/composables/contextMenu/useInitializeContextMenu.ts';
import { useInjectOrThrow } from '@/composables/helpers/useInjectOrThrow.ts';
import type { RayDb } from 'ray-db-wrapper';
import { useHoverTileState } from '@/composables/taskbar/useHoverTileState.ts';

const { taskbarTileItem } = defineProps<{ taskbarTileItem?: TaskbarTileItem }>();

const taskbarStore = useTaskbarStore();
const windowStore = useWindowStore();

const windowReference = computed(() => {
  if (!taskbarTileItem) return { reference: null, active: false, windowCount: 0 };
  const reference = windowStore.openWindowsReferences[taskbarTileItem.label];
  return {
    reference,
    active: reference && reference.length > 0,
    windowCount: reference && reference.length,
    minimizedWindowCount:
      reference &&
      reference.reduce(
        (accumulator, value) => (value.minimized ? accumulator + 1 : accumulator),
        0,
      ),
  };
});

const getUnderlineClass = computed(() => {
  if (!taskbarTileItem) return 'underline hidden';
  if (!windowStore.openWindowsReferences[taskbarTileItem.label]) return 'underline hidden';

  return windowReference.value.minimizedWindowCount === windowReference.value.windowCount
    ? 'underline minimized'
    : 'underline maximized';
});

const setClassOnHover = ref<'active' | null>(null);

const { hoverState, setHoverState, clearHoverState, clearHoverStateTimeout } = useHoverTileState();

const canOpenTabs = computed(
  () => windowReference.value.active && hoverState.value === true && taskbarTileItem !== undefined,
);

function onMouseEnter(useTimeout: boolean) {
  setClassOnHover.value = 'active';
  clearHoverStateTimeout();
  setHoverState(useTimeout);
}

function onMouseLeave() {
  clearHoverState(canOpenTabs.value, true, () => (setClassOnHover.value = null));
}

function onTabsUnmounted() {
  setClassOnHover.value = null;
  clearHoverState(false);
}

function onClickTile() {
  if (!taskbarTileItem) return;

  if (!windowReference.value.active) {
    windowStore.pushOpenWindowReference(taskbarTileItem.label);
    return;
  }

  clearHoverState(false);

  nextTick().then(() => (setClassOnHover.value = 'active'));

  if (windowReference.value.reference?.length === 1) {
    windowStore.setWindowMinimized(
      windowStore.getWindowId(taskbarTileItem.label, windowReference.value.reference[0].id),
    );
  }
}

const titleRef = ref();
const showTitle = computed(() => hoverState.value && !canOpenTabs.value);
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

const rayDb = useInjectOrThrow<RayDb>('rayDb');
function onContextmenu(event: MouseEvent) {
  useInitializeContextMenu(event)
    .taskbarTile()
    .initialize(
      {
        Delete: () => {
          if (!taskbarTileItem) return;
          taskbarStore.deleteTaskbarItem(rayDb, taskbarTileItem.tileId);
        },
      },
      {},
    );
}
</script>

<template>
  <div
    v-if="taskbarTileItem"
    class="tile"
    :class="setClassOnHover"
    @mouseenter.prevent="onMouseEnter(true)"
    @mouseleave.prevent="onMouseLeave"
    @contextmenu.prevent="onContextmenu"
    :style="{ width: `${taskbarStore.tileWidth}px`, height: `${taskbarStore.tileHeight}px` }"
  >
    <div ref="titleRef" v-if="showTitle" class="title-text-hover" :style="getTitleOverflowStyle">
      {{ taskbarTileItem.label }}
    </div>
    <transition name="fade-shadow">
      <TaskbarTabs
        v-if="canOpenTabs"
        :application-name="taskbarTileItem.label"
        @tabs-unmounted="onTabsUnmounted"
      />
    </transition>
    <div class="content" @click="onClickTile">
      <component class="app-svg" :is="useSvgOrFallback(taskbarTileItem.label).svg" />
      <hr :class="getUnderlineClass" />
    </div>
  </div>
</template>

<style scoped>
.tile {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.tile.active {
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
  -webkit-user-select: none;
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
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 10px;
}

.app-svg {
  width: 30px;
  height: 30px;
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
