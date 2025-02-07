<template>
  <div class="context-menu" ref="contextMenu">
    <div v-for="contextAction in contextActionsArray" :key="contextAction.actionType" class="context-actions-wrapper">
      <div v-if="targetTileIsFilled && contextAction.onTargetTileIsFilled === true" class="context-action">
        <SvgComponent :svg-type="contextAction.actionType" :custom-height="CONTEXT_MENU_SVG_HEIGHT" :custom-width="CONTEXT_MENU_SVG_WIDTH"
                      @clicked="$emit('clicked', {'event': $event, 'actionType': contextAction.actionType})"/>
      </div>
      <div v-else class="context-action">
        <SvgComponent :svg-type="contextAction.actionType" :custom-height="CONTEXT_MENU_SVG_HEIGHT" :custom-width="CONTEXT_MENU_SVG_WIDTH"
                      @clicked="$emit('clicked', {'event': $event, 'actionType': contextAction.actionType})"/>
      </div>
    </div>
  </div>
</template>

<script>
import SvgComponent from "@/ui/svg-component";
export default {
  name: "context-menu-component",
  components: {SvgComponent},
  props: {
    targetTileIsFilled: {
      type: Boolean,
      required: true,
      default: false
    },
  },
  data() {
    return {
      CONTEXT_MENU_SVG_WIDTH: 20,
      CONTEXT_MENU_SVG_HEIGHT: 20,
      contextActionsArray: [
          { 'actionType': 'copy', 'onTargetTileIsFilled': true },
          { 'actionType': 'delete', 'onTargetTileIsFilled': true },
          { 'actionType': 'paste', 'onTargetTileIsFilled': false },
      ]
    }
  }
}
</script>

<style scoped>
.context-menu {
  display: flex;
  flex-direction: column;
  position: absolute;
  background-color: var(--background-color-window);
  width: 120px;
  height: 100px;
  padding: 3px;
}

.context-actions-wrapper {
  display: flex;
  flex-direction: row;
  gap: 5px;
}

.context-action {
  display: flex;
  align-items: center;
  padding: 5px;
}

.context-action:hover {
  background-color: var(--hover-color);
  border-radius: 5px;
}

.context-action path {
  fill: var(--font-color);
}
</style>