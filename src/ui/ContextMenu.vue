<template>
  <section class="context-menu" ref="contextMenu"
           :style="{
              width:`${CONTEXT_MENU_WIDTH}px`,
              height: `${CONTEXT_MENU_HEIGHT}px`,
              left: `${leftPosition}px`,
              top: `${topPosition}px`
           }"
  >
    <div class="context-primary-actions-wrapper">
      <div v-for="(item, index) of primaryContextActions"
           :key="item.name"
      >
        <button class="context-action"
                :disabled="!item.active"
                :title="item.name"
                @click="$emit(`cm_primary_${index}`)"
        >
          <SvgComponent :svg-type="item.name"
                        :custom-height="CONTEXT_MENU_SVG_HEIGHT"
                        :custom-width="CONTEXT_MENU_SVG_WIDTH"
          />
        </button>
      </div>
    </div>
    <hr style="width: 90%; margin-top: 5px; margin-bottom: 5px;"/>
    <div class="context-secondary-actions-wrapper">
      <div v-for="(item, index) of secondaryContextActions"
           :key="item.name"
      >
        <div v-if="item.active"
             class="context-action"
             @click="$emit(`cm_secondary_${index}`)"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import SvgComponent from "@/ui/svg-component";
import {useGlobalState} from "@/stores/globalState";

export default {
  name: "ContextMenu",
  components: {SvgComponent},
  beforeMount() {
    if (this.height) {
      this.CONTEXT_MENU_HEIGHT = this.height;
    }

    if (this.width) {
      this.CONTEXT_MENU_WIDTH = this.width;
    }
  },
  mounted() {
    this.calculatePosition();
    addEventListener('click', this.handleClick)
  },
  unmounted() {
    removeEventListener('click', this.handleClick);
  },
  watch: {
    position() {
      this.calculatePosition();
    }
  },
  props: {
    position: {
      required: true,
      type: Object
    },
    height: {
      required: false,
      type: Number
    },
    width: {
      required: false,
      type: Number
    },
    /**
     * @type {Array<{name: string, active: boolean}>} - Array values containing an action and a boolean indicating if the action should be active
     */
    primaryContextActions: {
      required: false,
      type: Array,
      default: () => [
        {name: 'copy', active: true},
        {name: 'delete', active: true},
        {name: 'paste', active: true}
      ]
    },
    /**
     * @type {Array<{name: string, active: boolean}>} - Array values containing a secondary action and a boolean indicating if the action should be active
     */
    secondaryContextActions: {
      required: false,
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      CONTEXT_MENU_SVG_WIDTH: 20,
      CONTEXT_MENU_SVG_HEIGHT: 20,
      CONTEXT_MENU_WIDTH: 140,
      CONTEXT_MENU_HEIGHT: 133,
      leftPosition: 0,
      topPosition: 0
    }
  },
  computed: {
    globalState() {
      return useGlobalState();
    }
  },
  methods: {
    calculatePosition() {
      const conditionWidth = (this.position.x + this.CONTEXT_MENU_WIDTH + 25) > this.globalState.browserWindowSize.WIDTH;
      const conditionHeight = (this.position.y + this.CONTEXT_MENU_HEIGHT + 20) > this.globalState.browserWindowSize.HEIGHT;

      const leftValue = conditionWidth ? this.globalState.browserWindowSize.WIDTH - this.CONTEXT_MENU_WIDTH - 25 : this.position.x;
      const topValue = conditionHeight ? this.globalState.browserWindowSize.HEIGHT = this.CONTEXT_MENU_HEIGHT - 25 : this.position.y;

      this.leftPosition = leftValue;
      this.topPosition = topValue;
    },
    handleClick(e) {
      const contextMenu = this.$refs.contextMenu;

      //clicked outside of context menu
      if (contextMenu && !contextMenu.contains(e.target)) {
        this.$emit('close');
      }
    }
  }
}
</script>

<style scoped>
.context-menu {
  display: flex;
  flex-direction: column;
  position: absolute;
  padding: 10px;
  border: var(--border-input-color) 2px solid;
  border-radius: 11px;
  background-color: var(--background-color-window);
}

.context-primary-actions-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.context-secondary-actions-wrapper {
  display: flex;
  flex-direction: column;
  font-size: 10px;
}

.context-action {
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: 3px;
  cursor: pointer;
  background: none;
  border: none;
}

.context-action:hover {
  background-color: var(--hover-color);
}

.context-action:disabled {
  opacity: 0.3;
  background: none;
  cursor: default;
}

.context-action path {
  fill: var(--font-color);
}
</style>