<template>
  <div class="split-window-grid">
    <div class="corner split-window-element">
      <button class="top-left split-window-button-corner" @click="$emit('position', 'topLeft')"/>
      <button class="top-right split-window-button-corner" @click="$emit('position', 'topRight')"/>
      <button class="bottom-left split-window-button-corner" @click="$emit('position', 'bottomLeft')"/>
      <button class="bottom-right split-window-button-corner" @click="$emit('position', 'bottomRight')"/>
    </div>
    <div class="vertical split-window-element">
      <button class="left split-window-button-vertical" @click="$emit('position', 'left')"/>
      <button class="right split-window-button-vertical" @click="$emit('position', 'right')"/>
    </div>
    <div class="horizontal split-window-element">
      <button class="top split-window-button-horizontal" @click="$emit('position', 'top')"/>
      <button class="bottom split-window-button-horizontal" @click="$emit('position', 'bottom')"/>
    </div>
  </div>
</template>

<script>
export default {
  name: "split-windows-component",
  emits: ['position'],
  data() {
    return {}
  }
}
</script>

<style scoped>
.split-window-grid {
  position: absolute;
  top: 30px;
  display: grid;
  grid-template-rows: auto auto;
  gap: 5px;
  background-color: black;
  padding: 10px;
  border-radius: 5px;
}

.split-window-element {
  display: grid;
  gap: 5px;
  position: relative;
}

.corner, .vertical {
  grid-template-columns: auto auto;
}

.horizontal {
  grid-template-rows: auto auto;
}

.split-window-button-corner {
  height: 45px;
  width: 45px;
}

.split-window-button-vertical {
  height: 90px;
  width: 45px;
}

.split-window-button-horizontal {
  width: 98px;
  height: 45px;
}

.split-window-button-corner,
.split-window-button-vertical,
.split-window-button-horizontal
{
  border: none;
  border-radius: 5px;
  background-color: var(--font-color);
}

.split-window-button-corner:hover,
.split-window-button-vertical:hover,
.split-window-button-horizontal:hover
{
  background-color: var(--hover-color);
  border: 1px var(--hover-color) solid;
}
</style>