<template>
  <section>
    <MobileHome v-if="isMobile"></MobileHome>
    <DesktopHome v-if="isMobile === false" :background-image-id="1"></DesktopHome>
  </section>
</template>

<script>
import DesktopHome from "@/components/desktopComponents/desktop-home";
import MobileHome from "@/components/mobileComponents/mobile-home";

export default {
  name: 'App',
  components: {
    MobileHome,
    DesktopHome
  },
  data() {
    return {
      isMobile: false,
    }
  },
  mounted() {
    this.detectDevice();
  },
  methods: {
    detectDevice() {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileOrTablet = /mobile|android|tablet|ipad|iphone/.test(userAgent);
      // const hasPointerEvents = window.PointerEvent !== undefined;

      this.isMobile = isMobileOrTablet;
    }
  },
}
</script>

<style>
html, body {
  margin: 0;
  width: 100vw;
  height: 100vh;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}

DesktopHome {
  width: 100%;
  height: 100%;
}
</style>
