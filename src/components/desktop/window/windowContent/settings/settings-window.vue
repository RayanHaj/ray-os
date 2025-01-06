<template>
  <div class="window-content" ref="container">
    <nav class="sidebar" ref="sidebar">
      <div class="wrap-search">
        <input v-model="searchbarInput" class="searchbar" type="text" placeholder="Find a setting">
        <div class="search-svg">
          <svg-component :svg-type="'search'" :custom-width="20" :custom-height="20"/>
        </div>
      </div>
      <ul>
        <li v-for="option in getOptions" ref="sidebarOptions" :key="option" tabindex="0" @click="onClickOption(option)"
            :class="{ 'selected': selectedOption === option && option !== 'no matches' }">
          <div>
            <svg-component :svg-type="option" :custom-width="15" :custom-height="15"/>
          </div>
          {{ option }}
        </li>
      </ul>
    </nav>
    <div class="settings" :style="selectedOption === 'theme' ? { justifyContent: 'center', alignItems: 'center' } : null">
      <div v-show="selectedOption === 'background color'" class="background-color-wrapper">
        <div class="background-color-title-selected-wrapper">
          <div class="background-color-title">{{ selectedOption }}</div>
          <div class="selected-background-color">{{ globalState.getBackgroundColor().name }}</div>
        </div>
        <div class="color-grid" ref="colorGrid">
          <div class="background-color-list-item-wrapper" v-for="object in colors" :key="object.color">
            <div :id="object.name" class="background-color" ref="backgroundColor"
                 :style="{ 'background-color': object.color }"
                 :class="{ 'selected': globalState.getBackgroundColor() === object }" @click="updateBackgroundColor(object)">
              <div class="color-name" ref="colorName"> {{ object.name }} </div>
            </div>
          </div>
        </div>
      </div>
      <div v-show="selectedOption === 'wallpaper'" class="wallpaper-wrapper" ref="wallpaperWrapper">
        <div class="wallpaper-title-wrapper">
          <div class="wallpaper-title">{{ selectedOption }}</div>
        </div>
        <div class="wallpaper-grid" ref="wallpaperGrid">
          <div class="wallpaper"
               ref="wallpaper"
               v-for="wallpaper in wallpapers"
               :key="wallpaper"
               :class="{ 'selected': globalState.getWallpaper() === wallpaper }"
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
               :checked="globalState.getShowGridOutlineDesktop() === true"
               @change="globalState.setShowGridOutlineDesktop($event.target.checked)"
        >
      </div>
    </div>
  </div>
</template>

<script>
import json from '@/assets/json/config.json'
import SvgComponent from "@/components/ui/svg-component";
import { useGlobalState } from "@/stores/globalState";

export default {
  name: "settings-window",
  components: {SvgComponent},
  data() {
    return {
      themes: json.themes,
      colors: json.colors,
      wallpapers: json.wallpapers,
      options: ['home', 'theme', 'background color', 'wallpaper', 'desktop grid'],
      searchbarInput: '',
      selectedOption: '',
      FLEX_DIRECTION_CONTAINER: 'row',
      sidebarElement: {
        FONT_SIZE_NAV_ITEMS: 20
      }
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
      const theme = this.globalState.getTheme();
      if (theme === element.value) {
        element.selected = true;
      }
    });
  },
  watch: {
    applicationWindowSize(newValue) {
      const container = () => {
        this.$refs.container.style.flexDirection = newValue.width <= 840 ? 'column' : 'row';
        this.$refs.container.style.alignItems = newValue.width <= 840 ? 'center' : 'unset';
      }

      const backgroundColor = () => {
        this.$refs.backgroundColor.forEach((element) => {
          element.style.width = `${ Math.max(100, newValue.width / 7) }px`;
        });

        this.$refs.colorGrid.style.gridTemplateColumns =
            newValue.width <= 255 ? 'auto' : newValue.width <= 505 ? 'auto auto' : 'auto auto auto auto';

        this.$refs.colorName.forEach((element) => {
          element.style.width = `${ Math.max(70, newValue.width / 10) }px`;
          element.style.fontSize = `${ Math.max(7, newValue.width / 100) }px`;
        });
      }

      const wallpaper = () => {
        this.$refs.wallpaper.forEach(element => {
          element.style.width = `${ Math.max(100, newValue.width / 5) }px`;
        })
      }

      const sidebar = () => {
        this.$refs.sidebar.style.width = newValue.width <= 840 ? '100%' : '20%';
        this.$refs.sidebar.style.backgroundColor = newValue.width <= 840 ? 'rgba(0, 0, 0, 0.9)' : 'transparent';

        this.$refs.sidebarOptions.forEach(element => {
          element.style.fontSize = `${Math.max(12, newValue.width / 100)}px`;
        });
      }

      container();
      backgroundColor();
      wallpaper();
      sidebar();
    }
  },
  methods: {
    getImgUrl(wallpaper) {
      return require(`@/assets/images/desktopWallpapers/${wallpaper}`);
    },
    onClickOption(option) {
      this.selectedOption = option;
    },
    updateBackgroundColor(newValue) {
      this.globalState.removeWallpaper();
      this.globalState.setBackgroundColor(newValue);
    },
    updateWallpaper(newValue) {
      this.globalState.removeBackgroundColor();
      this.globalState.setWallpaper(newValue);
    },
    updateTheme(newValue) {
      this.globalState.setTheme(newValue);
    }
  },
  computed: {
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
    },
    globalState() {
      return useGlobalState();
    },
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
  gap: 5px;
}

.sidebar {
  display: flex;
  position: sticky;
  flex-direction: column;
  min-width: 20%;
  top: 0;
  z-index: 0;
  padding: 10px 0 0 10px;
  border-radius: 5px;
}

.settings {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
}

.option {
  cursor: pointer;
  user-select: none;
}

.background-color {
  position: relative;
  border-radius: 5px;
  width: 300px;
  height: 150px;
  border: 5px var(--border-input-color) solid;
}

.background-color.selected {
  border-color: var(--border-input-selected-color);
}

.color-name {
  position: absolute;
  text-align: center;
  background-color: var(--background-color-input);
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
  width: 200px;
  font-size: 14px;
}

.color-grid {
  display: grid;
  grid-template-columns: auto auto auto auto;
  gap: 20px;
  flex-direction: column;
  justify-content: center;
}

.background-color-title-selected-wrapper {
  display: flex;
  justify-content: space-between;
  font-size: 30px;
  font-weight: bold;
}

.background-color-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 10px;
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


ul {
  display: flex;
  flex-direction: column;
  padding: 0;
  width: 100%;
  list-style: none;
  gap: 10px;
}

li {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 5px;
  border: 2px solid var(--border-input-color);
  background-color: var(--taskbar-color);
  border-radius: 5px;
  user-select: none;
}

li.selected {
  border-color: var(--border-input-selected-color);
}

.wrap-search {
  position: relative;
}

.search-svg {
  position: absolute;
  top: calc(50% - 10px);
  right: 8px;
}

.searchbar {
  width: 100%;
  padding: 7px;
  border: 2px solid var(--border-input-color);
  background-color: var(--taskbar-color);
  border-radius: 5px;
  font-size: 15px;
}

.searchbar:focus {
  outline: none;
  border-color: var(--border-input-selected-color);
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