<template>
  <img @click="$emit('clicked')" class="image" :src="getImageUrl" :width="width" :height="height" :alt="`image[${imageName}]`">
</template>

<script>
import { parseApplicationNameToImageNameFormat } from "@/utils/util"
export default {
  name: "img-component",
  props: {
    imageName: {
      required: true,
      default: 'default-image'
    },
    customWidth: {
      required: false
    },
    customHeight: {
      required: false
    }
  },
  data() {
    return {
      imageExists: false,
      parsedImageName: '',
      width: undefined,
      height: undefined
    };
  },
  beforeMount() {
    if (this.customWidth) {
      this.width = this.customWidth;
    }
    if (this.customHeight) {
      this.height = this.customHeight;
    }
  },
  mounted() {
    this.parsedImageName = parseApplicationNameToImageNameFormat(this.imageName);
    this.checkIfImageExists();
  },
  computed: {
    getImageUrl() {
      return this.imageExists ? require(`@/assets/images/applicationImages/${this.parsedImageName}.png`) : require('@/assets/images/default-image.png');
    }
  },
  methods: {
    checkIfImageExists() {
      try {
        const img = new Image();
        img.src = require(`@/assets/images/applicationImages/${this.parsedImageName}.png`);

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