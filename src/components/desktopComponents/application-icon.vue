<template>
  <div v-if="imageExists" class="footer-bar-item">
    <img class="icon" :src="getImageUrl" :width="width ? width : 25" :height="height ? height : 25"
         :alt="this.iconImgName">
  </div>
</template>

<script>
export default {
  name: "application-icon",

  props: {
    iconImgName: String,
    height: Number,
    width: Number
  },

  data() {
    return {
      imageExists: false
    };
  },

  mounted() {
    this.checkIfImageExists();
  },

  computed: {
    getImageUrl() {
      return require(`@/assets/images/footerIcons/${this.iconImgName}.png`);
    }
  },

  methods: {
    checkIfImageExists() {
      try {
        const img = new Image();
        img.src = require(`@/assets/images/footerIcons/${this.iconImgName}.png`);

        img.onload = () => {
          this.imageExists = true;
        };
      } catch (error) {
        this.imageExists = false;
      }
    }
  }
}
</script>

<style scoped>
</style>