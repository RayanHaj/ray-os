<template>
  <select>
    <slot />
  </select>
</template>
<style scoped>
select {
  height: 30px;
  border: var(--input-border-color) 1px solid;
  font-size: var(--font-size-elg);
  background-color: var(--input-primary-color);
  border-radius: 5px;
}

option:checked {
  background-color: var(--input-secondary-color);
}

option:focus {
  color: red;
}
</style>
