<template>
  <section>
    <LoginScreen @login-finished="loginFinished = true"></LoginScreen>
    <MobileHome v-if="isMobile && loginFinished"></MobileHome>
    <DesktopHome v-if="(isMobile === false) && loginFinished" :background-image-id="1"></DesktopHome>
  </section>
</template>

<script>
import DesktopHome from "@/components/desktopComponents/desktop-home";
import MobileHome from "@/components/mobileComponents/mobile-home";
import LoginScreen from "@/components/desktopComponents/login-screen";

export default {
  name: 'App',
  components: {
    LoginScreen,
    MobileHome,
    DesktopHome
  },
  data() {
    return {
      isMobile: false,
      loginFinished: false,
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
LoginScreen {
  width: 100%;
  height: 100%;
}
</style>
