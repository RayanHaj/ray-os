<template>
  <div v-if="activatedEasterEgg === null" class="desktop">
    <div class="main-screen">
      <MainWindow v-if="openWindows.includes('file-explorer')" @close-tab="closeWindow"
                  @rendered="windowIsRendered = !windowIsRendered" :window-size="windowDimensions"
                  window-name="file-explorer"
                  @battery-easter-egg-activated="activatedEasterEgg = $event" class="windows"></MainWindow>
      <MainWindow v-if="openWindows.includes('settings')" @close-tab="closeWindow" @rendered="windowIsRendered = !windowIsRendered"
                  :window-size="windowDimensions" window-name="settings"
                  @battery-easter-egg-activated="activatedEasterEgg = $event" @theme-changed="$emit('themeChanged')" class="windows"/>
      <DesktopGrid grid-size="large" @application-name="setApplicationNameVariable" :application-name="applicationName"
                   :application-names="applicationNames" :window-size="windowDimensions" class="desktop-grid"></DesktopGrid>
    </div>
    <div class="footer-container">
      <SettingsMenu ref="settingsMenu" v-if="quickSettingMenuIsOpen" class="quick-settings-menu"></SettingsMenu>
      <FooterBar ref="footerBar" class="footer" @application-name="setApplicationNameVariable"
                 @quick-settings-menu-open="openQuickSettingsMenu" :application-names="applicationNames"></FooterBar>
    </div>
  </div>
</template>

<script>
import FooterBar from "@/components/desktopComponents/footer/footer-bar";
import DesktopGrid from "@/components/desktopComponents/desktop-grid";
import MainWindow from "@/components/desktopComponents/draggableWindows/main-window";
import SettingsMenu from "@/components/desktopComponents/footer/footerComponents/settings-menu";

export default {
  name: "desktop-home",

  data() {
    return {
      windowIsRendered: false,
      quickSettingMenuIsOpen: false,
      windowWidth: '',
      windowHeight: '',
      applicationName: '',
      activatedEasterEgg: null,
      openWindows: [],
      windowDimensions: [],
      backgroundColor: 'black',
      applicationNames: ['windows-start', 'microsoft-edge', 'file-explorer', 'settings']
    }
  },
  components: {SettingsMenu, MainWindow, DesktopGrid, FooterBar},
  props: {
    backgroundImageId: Number
  },
  async mounted() {
    this.updateSettings();
    window.addEventListener('resize', this.updateWindowDimensions);
    window.addEventListener('click', await this.closeOpenWindows);
  },
  created() {
    this.windowDimensions = [window.innerWidth, window.innerHeight - 45]
  },
  async beforeUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
    window.addEventListener('click', await this.closeOpenWindows);
  },
  methods: {
    setApplicationNameVariable(name) {
      console.log(this.openWindows)
      if (!this.openWindows.includes(name)) {
        this.openWindows.push(name);
        this.applicationName = name;
      }
    },
    closeWindow(value) {
      this.openWindows = this.openWindows.filter(name => name !== value);

      if (value === 'settings') {
        this.updateSettings();
      }
    },
    updateWindowDimensions() {
      const NAVBAR_HEIGHT = 45;
      this.windowDimensions = [window.innerWidth, window.innerHeight - NAVBAR_HEIGHT];
    },
    // updateWindowSizeContainer(sizes) {
    //   // const windowsElement = document.querySelector('.windows');
    //   // windowsElement.style.top = sizes.top;
    //   // windowsElement.style.left = sizes.left;
    //
    //   // const windowsElement = document.querySelector('.windows');
    //   //
    //   // if (sizes.width !== null && sizes.height !== null) {
    //   //   windowsElement.style.width = sizes.width;
    //   //   windowsElement.style.height = sizes.height;
    //   // }
    //   //
    //   // windowsElement.style.top = sizes.top;
    //   // windowsElement.style.left = sizes.left;
    //   // console.log(sizes);
    // },
    updateSettings() {
      const desktopElement = document.querySelector('.desktop');

      const backgroundPreference = localStorage.getItem('background-preference');

      if (Number(backgroundPreference) === 1) {
        const backgroundColor = localStorage.getItem('background-color');
        if (backgroundColor) {
          this.backgroundColor = backgroundColor;
          desktopElement.style.backgroundColor = this.backgroundColor;
          desktopElement.style.backgroundImage = null;
        }
      } else {
        const backgroundImage = Number(localStorage.getItem('background-image'));
        if (backgroundImage !== 0) {
          desktopElement.style.backgroundImage = `url(${require(`@/assets/images/desktopWallpapers/wallpaper_0${backgroundImage}.png`)})`;
        }
      }
    },
    async openQuickSettingsMenu() {
      const settingsMenu = this.$refs.settingsMenu;

      if (this.quickSettingMenuIsOpen) {
        await settingsMenu.closeSettingsMenuAnimation().then(() => {
          this.quickSettingMenuIsOpen = !this.quickSettingMenuIsOpen;
        });
        return;
      }

      this.quickSettingMenuIsOpen = !this.quickSettingMenuIsOpen;
    },
    validateBeforeClosingWindows(settingsMenu, footer, e) {
      if (!this.quickSettingMenuIsOpen) {
        return false;
      }

      if (footer.getRefQuickSettingsMenuButton().contains(e.target)) {
        return false;
      }

      const children = Array.from(settingsMenu.$el.querySelectorAll('.btn'));
      const btnElements = children.filter((child => child.classList.contains('btn')));

      let result = null;
      for (let element of btnElements) {
        if (element.contains(e.target)) {
          result = true;
        }
      }

      if (result) {
        return result;
      }

      if (settingsMenu.$el.contains(e.target)) {
        return false;
      }

      return true;
    },
    async closeOpenWindows(e) {
      if (this.quickSettingMenuIsOpen === true) {
        e.preventDefault();
        const settingsMenu = this.$refs.settingsMenu;
        const footer = this.$refs.footerBar;
        if (footer) {
          if (this.validateBeforeClosingWindows(settingsMenu, footer, e)) {
            await settingsMenu.closeSettingsMenuAnimation().then(() => {
              this.quickSettingMenuIsOpen = !this.quickSettingMenuIsOpen;
            });
          }
        }
      }
    },
    easterEggCompleted() {
      this.activatedEasterEgg = null;
      this.$nextTick(() => {
        this.updateSettings();
      })
    }
  },
  watch: {
    windowIsRendered() {
      this.updateWindowDimensions();
    },

    activatedEasterEgg() {
      console.log(this.activatedEasterEgg);
    }
  }
}
</script>

<style scoped>
* {
  color: black;
}

.desktop {
  position: fixed;
  height: 100%;
  width: 100%;
  background-size: cover;
  background-position: center;
  z-index: 1;
}

.desktop-grid {
  z-index: 0;
  overflow: hidden;
}

.windows {
  position: absolute;
  width: 100%;
  height: calc(100% - 45px);
  z-index: 2;
}

.footer {
  z-index: 2;
}

.quick-settings-menu {
  position: fixed;
  right: 20px;
  bottom: 60px;
  width: 350px;
}

.footer-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>