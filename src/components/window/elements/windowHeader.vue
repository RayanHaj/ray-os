<template>
  <header class="window-header"
          @click="this.emitInterceptorHeader('clickHeader', $event)"
          @mousedown.prevent="this.emitInterceptorHeader('mousedownHeader', $event)"
  >
    <div class="header-start">
      <ImgComponent
          :image-name="name"
          :custom-width="20"
          :custom-height="20"
      />
      <h5 class="window-name">{{ name }}</h5>
    </div>
    <div class="header-end">
      <button
          class="minimize-button"
          @click="$emit('minimize')"
      >
        <SvgComponent :svg-type="'minimize'"/>
      </button>
      <button
          class="maximize-button"
          @click="$emit('maximize')"
          @mouseenter="$emit('mouseenterMaximize')"
          @mouseleave="$emit('mouseleaveMaximize')"
      >
        <SvgComponent :svg-type="'maximize'"/>
      </button>
      <button
          class="close-button"
          @click="$emit('close')"
      >
        <SvgComponent :svg-type="'close'"/>
      </button>
    </div>
  </header>
</template>
<script>
import SvgComponent from "@/ui/svg-component.vue";
import ImgComponent from "@/ui/img-component.vue";

export default {
  name: 'windowHeader',
  components: {
    ImgComponent,
    SvgComponent
  },
  props: {
    'name': {
      required: true,
      type: String
    }
  },
  methods: {
    emitInterceptorHeader(emitMessage, e) {
      if (e.target.className === this.$el.className) {
        this.$emit(emitMessage, e);
      }
    }
  }
}
</script>
<style scoped>
.window-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 30px;
}

.header-start {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 30px;
  padding-left: 10px;
}

.window-name {
  margin-left: 10px;
}

.header-end {
  display: flex;
  flex-direction: row;
  justify-content: end;
  height: 100%;
  width: auto;
}

.header-end button {
  background-color: transparent;
  border: none;
  padding: 8px;
  width: 60px;
}

.close-button:hover {
  background-color: red;
}

.maximize-button:hover, .minimize-button:hover {
  background-color: var(--border-input-color);
}
</style>