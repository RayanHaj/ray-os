<template>
  <section class="window-content" ref="container">
    <Sidebar @option-selected="onClickOption"/>
    <div class="settings" :style="selectedOption === 'theme' ? { justifyContent: 'center', alignItems: 'center' } : null">
      <BackgroundColor v-show="selectedOption === 'background color'"/>
      <div v-show="selectedOption === 'wallpaper'" class="wallpaper-wrapper" ref="wallpaperWrapper">
        <div class="wallpaper-title-wrapper">
          <div class="wallpaper-title">{{ selectedOption }}</div>
        </div>
        <div class="wallpaper-grid" ref="wallpaperGrid">
          <div class="wallpaper"
               ref="wallpaper"
               v-for="wallpaper in wallpapers"
               :key="wallpaper"
               :class="{ 'selected': preferencesStore.getWallpaper() === wallpaper }"
               @click="updateWallpaper(wallpaper)">
            <img class="wallpaper-image" :src="getImgUrl(wallpaper)" :alt="wallpaper" draggable="false">
          </div>
        </div>
      </div>
      <div v-show="selectedOption === 'theme'" class="theme-wrapper">
        <div class="theme-title-wrapper">
          <div class="theme-title">{{ selectedOption }}</div>
        </div>
        <select @click="updateTheme($event.target.value)" class="theme-picker" id="theme-picker">
          <option ref="themePickerOptions" v-for="theme in themes" :key="theme">{{ theme }}</option>
        </select>
      </div>
      <div v-show="selectedOption === 'desktop grid'" class="desktop-grid-options-wrapper">
        <input type="checkbox"
               :checked="preferencesStore.getShowGridOutlineDesktop() === true"
               @change="preferencesStore.setShowGridOutlineDesktop($event.target.checked)"
        >
      </div>
    </div>
  </section>
</template>

<script>
import json from '@/assets/json/config.json'
import {usePreferencesStore} from "@/stores/globalState";
import {mapStores} from "pinia";
import Sidebar from "@/components/window/content/settings/SettingsSidebar.vue";
import BackgroundColor from "@/components/window/content/settings/SettingsBackgroundColor.vue";

export default {
  name: "settings-window",
  components: {BackgroundColor, Sidebar},
  data() {
    return {
      themes: json.themes,
      colors: json.colors,
      wallpapers: json.wallpapers,
      options: ['home', 'theme', 'background color', 'wallpaper', 'desktop grid', 'enable block game'],
      selectedOption: '',
      FLEX_DIRECTION_CONTAINER: 'row',
    }
  },
  props: {
    applicationWindowSize: {
      type: Object,
      required: true
    }
  },
  mounted() {
    this.$refs.themePickerOptions.forEach(element => {
      const theme = this.preferencesStore.getTheme();
      if (theme === element.value) {
        element.selected = true;
      }
    });
  },
  watch: {
  },
  methods: {
    getImgUrl(wallpaper) {
      return require(`@/assets/images/desktopWallpapers/${wallpaper}`);
    },
    onClickOption(option) {
      this.selectedOption = option;
    },
    updateBackgroundColor(newValue) {
      this.preferencesStore.removeWallpaper();
      this.preferencesStore.setBackgroundColor(newValue);
    },
    updateWallpaper(newValue) {
      this.preferencesStore.removeBackgroundColor();
      this.preferencesStore.setWallpaper(newValue);
    },
    updateTheme(newValue) {
      this.preferencesStore.setTheme(newValue);
    }
  },
  computed: {
    ...mapStores(usePreferencesStore),
    getOptions() {
      const filter = () => {
        return this.options.filter((option) => {
          return option.includes(this.searchbarInput)
        });
      }

      if (filter().length === 0) {
        return ['no matches'];
      }

      if (this.searchbarInput.length !== 0) {
        return filter();
      }

      return this.options;
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  color: var(--font-color);
}

.window-content {
  display: flex;
  flex-direction: row;
  gap: 20px;
  container-type: inline-size;
}

.settings {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
}

.wallpaper-title-wrapper {
  display: flex;
  justify-content: space-between;
  font-size: 30px;
}

.wallpaper-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 10px;
}

.wallpaper-grid {
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 20px;
  flex-direction: column;
  justify-content: center;
}

.wallpaper {
  position: relative;
  border: 2px solid var(--border-input-color);
}

.wallpaper.selected {
  border-color: var(--border-input-selected-color);
}

.wallpaper-image {
  width: 100%;
  height: 100%;
}

.theme-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 10px;
  text-align: start;
  align-items: center;
  width: 90%;
  height: 100%;
}
.theme-title-wrapper {
  font-size: 30px;
  width: 100%;
  text-align: start;
}
.theme-picker {
  width: 100%;
  min-height: 40px;
  height: 10%;
  border-radius: 10px;
  background-color: var(--background-color-input);
  border-color: var(--border-input-color);
  font-size: 25px;
}
</style>