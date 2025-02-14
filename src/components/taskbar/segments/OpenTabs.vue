<template>
  <li class="tab"
      v-for="tab in tabs"
      :key="tab.id"
      @click="onClickTab(tab.id)"
  >
    <p class="open-tab-name">{{ tab.name }} {{ tab.id }}</p>
    <div class="open-tab-close"
         @click="closeTab(tab.id)"
    >
      <button class="close-tab-button">
        <svg-component
            svg-type="close"
            :custom-width="18"
            :custom-height="18"
        />
      </button>
    </div>
  </li>
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
.open-tab-close {
  padding-top: 5px;
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