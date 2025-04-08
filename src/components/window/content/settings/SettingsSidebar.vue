<template>
  <nav class="sidebar" ref="sidebar">
    <div class="search-wrapper">
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
</template>
<script>
  import SvgComponent from "@/ui/svg-component.vue";

  export default {
    name: 'settings-sidebar',
    components: {SvgComponent},
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
      }
    },
    data() {
      return {
        searchbarInput: '',
        selectedOption: '',
        options: ['home', 'theme', 'background color', 'wallpaper', 'desktop grid', 'enable block game']
      }
    },
    methods: {
      onClickOption(option) {
        this.selectedOption = option;
        this.$emit('optionSelected', this.selectedOption);
      }
    }
  }
</script>
<style scoped>
.sidebar {
  display: flex;
  position: sticky;
  flex-direction: column;
  min-width: 20%;
  top: 0;
  padding: 10px 0 0 10px;
  border-radius: 5px;
}
.search-wrapper {
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
  color: white;
}
.searchbar:focus {
  outline: none;
  border-color: var(--border-input-selected-color);
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
</style>