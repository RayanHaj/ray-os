<template>
  <ul :style="{right: isFirstItem ? '-108px' : '-55px' }">
    <li class="tab"
        v-for="tab in tabs"
        :key="tab.id"
        @click.stop="onClickTab(tab.id)"
    >
      <p class="open-tab-name">{{ tab.name }} {{ tab.id }}</p>
      <button class="close-tab-button" @click.stop="closeTab(tab.id)">
        <svg-component
            svg-type="close"
            :custom-width="18"
            :custom-height="18"
        />
      </button>
    </li>
  </ul>
</template>
<script>
import SvgComponent from "@/ui/svg-component";

export default {
  components: {SvgComponent},
  emits: ['clicked', 'closed'],
  props: {
    tabs: {
      type: Array,
      required: true
    },
    isFirstItem: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    onClickTab(id) {
      this.$emit('clicked', id)
    },
    closeTab(id) {
      this.$emit('closed', id)
    }
  }
}
</script>
<style scoped>
ul {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  bottom: 45px;
  border: var(--border-window-color) 2px solid;
  border-radius: 10px;
  overflow: hidden;
}
.tab {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 10px;
  font-size: 11px;
  width: 130px;
  z-index: 9999;
  background-color: var(--background-color);
  color: var(--font-color);
}

.tab:hover {
  background-color: var(--hover-color);
}

.close-tab-button {
  display: flex;
  justify-content: center;
  padding: 5px 5px 5px 5px;
  border-radius: 50%;
  height: 100%;
}

.close-tab-button:hover {
  background-color: var(--border-input-color);
}

button {
  border: none;
  background-color: transparent;
}
</style>