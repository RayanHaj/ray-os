<script setup lang="ts">
  import type { PropType } from 'vue'
  type WindowReference = {
      id: number
      zIndex: number
      minimized: boolean
    }

  defineProps({
    windowReference: {
      required: true,
      type: Object as PropType<WindowReference>
    },
    applicationName: {
      required: true,
      type: String
    }
  })
</script>

<template>
  <li class="tab">
    <div>
      {{ windowReference.id }}: {{ applicationName }}
    </div>
    <button>
      x
    </button>
  </li>
</template>

<style scoped>
  .tab {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    background-color: blue;
    padding: 10px;
    border-radius: 5px;
  }
</style>
