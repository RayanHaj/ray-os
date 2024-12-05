<template>
  <div class="footer-bar-item">
    <svg-component :svg-type="iconImgName.toLowerCase()" :custom-width="width" :custom-height="height"></svg-component>
<!--    <img class="icon" :src="getImageUrl" :width="width ? width : 25" :height="height ? height : 25"-->
<!--         :alt="this.iconImgName">-->
  </div>
</template>

<script>
import { parseApplicationNameToImageNameFormat } from "@/utils/util"
import SvgComponent from "@/components/ui/svg-component";
export default {
  name: "application-icon",
  components: {SvgComponent},
  props: {
    iconImgName: String,
    height: Number,
    width: Number
  },

  data() {
    return {
      imageExists: false,
      parsedName: ''
    };
  },

  mounted() {
    this.parsedName = parseApplicationNameToImageNameFormat(this.iconImgName);
    this.checkIfImageExists();
  },

  computed: {
    getImageUrl() {
      return this.imageExists ? require(`@/assets/images/footerIcons/${this.parsedName}.png`) : require('@/assets/images/footerIcons/default-image.png');
    }
  },

  methods: {
    checkIfImageExists() {
      try {
        const img = new Image();
        img.src = require(`@/assets/images/footerIcons/${this.parsedName}.png`);

        img.onload = () => {
          this.imageExists = true;
        };

        img.onerror = () => {
          this.imageExists = false;
        }
      } catch (error) {
        this.imageExists = false;
      }
    }
  }
}
</script>

<style scoped>
</style>