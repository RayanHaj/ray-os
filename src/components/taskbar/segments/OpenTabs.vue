<template>
  <div class="tab"
       v-for="tab in tabs"
       :key="tab.id"
       @click="onClickTab(tab.id)"
  >
    <div class="open-tab-name">{{ tab.name }} {{ tab.id }}</div>
    <div class="open-tab-close"
         @click="closeTab(tab.id)"
    >
      <svg-component
          svg-type="close"
          :custom-width="18"
          :custom-height="18"
      />
    </div>
  </div>
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
</style>