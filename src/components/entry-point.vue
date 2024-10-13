<template>
  <MobileLogin v-if="isMobile"></MobileLogin>
  <DesktopLogin v-else></DesktopLogin>
</template>

<script>
import DesktopLogin from "@/components/desktopComponents/desktop-login";
import MobileLogin from "@/components/mobileComponents/mobile-login";

export default {
  name: "entry-point",
  components: {MobileLogin, DesktopLogin},
  data() {
    return {
      isMobile: false
    }
  },
  mounted() {
    this.detectDevice();
  },
  methods: {
    detectDevice() {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileOrTablet = /mobile|android|tablet|ipad|iphone/.test(userAgent);

      this.isMobile = isMobileOrTablet;
    }
  },
}
</script>

<style scoped>
</style>