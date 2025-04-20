<script setup lang="ts">
  import IconTooling from '@/components/icons/IconTooling.vue'
  import IconCommunity from '@/components/icons/IconCommunity.vue'
  import IconDocumentation from '@/components/icons/IconDocumentation.vue'
  import { useTaskbarStore } from '@/stores/taskbar.ts'

  const flying = false;
  const taskbarHeight = useTaskbarStore().taskbarHeight;
</script>

<template>
  <div class="taskbar" :class="{'active': !flying}" :style="{height: `${taskbarHeight}px`}">
    <div class="flying" :class="{'active': flying}">
      <div :style="{marginLeft: '20px'}"><IconTooling/></div>
      <div><IconDocumentation/></div>
      <div :style="{marginRight: '20px'}"><IconCommunity/></div>
    </div>
  </div>
</template>

<style scoped>
.taskbar {
  display: flex;
  justify-content: center;
  align-items: center;
  top: 100%;
  position: sticky;
}

.flying {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  height: 80%;
  border-radius: 10px;
}

.active {
  background-color: black;
  color: white;
}
</style>
