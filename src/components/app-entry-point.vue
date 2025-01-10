<template>
  <transition name="fade">
    <DesktopHome/>
  </transition>
</template>

<script>
import {deviceIsMobile} from "@/utils/util";
import DesktopHome from "@/components/desktop/desktop-home";

export default {
  name: "app-entry-point",
  components: { DesktopHome },
  data() {
    return {
      isMobile: deviceIsMobile(),
    }
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, filter 0.5s ease;
}
.fade-enter-from {
  opacity: 0;
  filter: blur(5px);
}
.fade-leave-to {
  opacity: 0;
  filter: blur(5px);
}

</style>