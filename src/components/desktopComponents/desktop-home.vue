<template>
  <div class="desktop">
    <div class="main-screen">
      <!--      <MainWindow @close-tab="closeWindow" :open-windows="openWindows" :window-dimensions="windowDimensions"></MainWindow>-->
      <!--
      @Param: grid-size = small || medium || larger || large;
      -->
      <!--      <div v-for="(window, index) in openWindows" :key="index" class="windows">-->
      <!--        <MainWindow v-if="window === 'file-explorer'" @close-tab="closeWindow" @rendered="windowIsRendered = !windowIsRendered" :window-size="windowDimensions" window-name="file-explorer" @window-sizes="updateWindowSizeContainer"></MainWindow>-->
      <!--        <MainWindow v-if="window === 'settings'" @close-tab="closeWindow" @rendered="windowIsRendered = !windowIsRendered" :window-size="windowDimensions" window-name="settings" @window-sizes="updateWindowSizeContainer"/>-->
      <!--      </div>-->
      <MainWindow v-if="openWindows.includes('file-explorer')" @close-tab="closeWindow"
                  @rendered="windowIsRendered = !windowIsRendered" :window-size="windowDimensions"
                  window-name="file-explorer" @window-sizes="updateWindowSizeContainer" class="windows"></MainWindow>
      <MainWindow v-if="openWindows.includes('settings')" @close-tab="closeWindow" @rendered="windowIsRendered = !windowIsRendered"
                  :window-size="windowDimensions" window-name="settings" @window-sizes="updateWindowSizeContainer" class="windows"/>
      <DesktopGrid grid-size="large" @application-name="setApplicationNameVariable" :application-name="applicationName"
                   :application-names="applicationNames" class="desktop-grid"></DesktopGrid>
    </div>
    <FooterBar class="footer" @application-name="setApplicationNameVariable"
               :application-names="applicationNames"></FooterBar>
  </div>
</template>

<script>
import FooterBar from "@/components/desktopComponents/footer-bar";
import DesktopGrid from "@/components/desktopComponents/desktop-grid";
import MainWindow from "@/components/desktopComponents/draggableWindows/main-window";

export default {
  name: "desktop-home",

  data() {
    return {
      windowIsRendered: false,
      windowWidth: '',
      windowHeight: '',
      applicationName: '',
      openWindows: [],
      windowDimensions: [],
      backgroundColor: 'black',
      applicationNames: ['windows-start', 'microsoft-edge', 'file-explorer', 'settings']
    }
  },
  components: {MainWindow, DesktopGrid, FooterBar},
  props: {
    backgroundImageId: Number
  },
  mounted() {
    this.updateSettings();
    window.addEventListener('resize', this.updateWindowDimensions);
  },
  created() {
    this.windowDimensions = [window.innerWidth, window.innerHeight - 45]
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
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
    }
  },
  watch: {
    windowIsRendered() {
      this.updateWindowDimensions();
    },
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
</style>