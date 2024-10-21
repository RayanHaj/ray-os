<template>
  <MobileLogin v-if="isMobile"></MobileLogin>
  <DesktopLogin v-else></DesktopLogin>
</template>

<script>
import DesktopLogin from "@/components/desktopComponents/desktop-login";
import MobileLogin from "@/components/mobileComponents/mobile-login";
import {deviceIsMobile} from "@/utils/util";

export default {
  name: "entry-point",
  components: {MobileLogin, DesktopLogin},
  data() {
    return {
      isMobile: deviceIsMobile(),
    }
  }
}
</script>

<style scoped>
</style>