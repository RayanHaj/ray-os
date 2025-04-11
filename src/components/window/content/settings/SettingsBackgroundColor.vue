<template>
  <section class="background-color-container">
    <div class="background-color-header">
      <h1 class="background-color-title">Background color: {{ stores.preferencesStore.getBackgroundColor()?.name }}</h1>
    </div>
    <div class="color-grid">
      <div class="background-colors" v-for="object in colors" :key="object.color">
        <button :id="object.name" class="background-color"
             :style="{ 'background-color': object.color }"
             :class="{ 'selected': selectedColor.color === object.color }" @click="updateBackgroundColor(object)">
        </button>
      </div>
    </div>
  </section>
</template>
<script>
  import {usePreferencesStore} from "@/stores/globalState";
  import json from "@/assets/json/config.json";

  export default {
    name: 'settings-background-color',
    computed: {
      stores() {
        return {
          'preferencesStore': usePreferencesStore()
        }
      }
    },
    data() {
      return {
        colors: json.colors,
        selectedColor: {}
      }
    },
    beforeMount() {
      const backgroundColor = this.stores.preferencesStore.getBackgroundColor();

      if (backgroundColor !== undefined) {
        this.selectedColor = backgroundColor;
      }
    },
    methods: {
      updateBackgroundColor(newValue) {
        this.stores.preferencesStore.removeWallpaper();
        this.stores.preferencesStore.setBackgroundColor(newValue);
        this.selectedColor = this.stores.preferencesStore.getBackgroundColor();
      },
    }
  }
</script>
<style scoped>
.background-color-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 10px;
  width: 80%;
  overflow: hidden;
}
.background-colors {
  width: 100%;
  height: 100%;
}

.background-color {
  position: relative;
  border-radius: 5px;
  height: 200px;
  width: 100%;
  cursor: pointer;
  border: 5px var(--border-input-color) solid;
}

.background-color.selected {
  border-color: var(--border-input-selected-color);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding-right: 10px;
  flex-direction: column;
  justify-content: center;
  overflow: auto;
}

.background-color-header {
  display: flex;
  justify-content: space-between;
  font-size: 30px;
  font-weight: bold;
}
</style>