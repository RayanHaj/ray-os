<template>
  <MobileLogin v-if="isMobile"></MobileLogin>
  <DesktopLogin v-else></DesktopLogin>
</template>

<script>
import DesktopLogin from "@/components/desktop/desktop-login";
import MobileLogin from "@/components/mobile/mobile-login";
import {deviceIsMobile} from "@/utils/util";

export default {
  name: "app-entry-point",
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