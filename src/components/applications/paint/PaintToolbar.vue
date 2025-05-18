<script setup lang="ts">
  const items = [
    {name: 'helo'},
    {name: 'helo'},
    {name: 'helo'},
    {name: 'helo'},
    {name: 'helo'},
  ]
</script>

<template>
  <div class="paint-toolbar">
    <ul class="paint-items">
      <li class="paint-item">
        <input type="color">
      </li>
    </ul>
  </div>
</template>

<style scoped>
  .paint-toolbar {
    background: var(--highlight-color);
    width: 100%;
    height: 40px;
  }

  .paint-items {
    display: flex;
    flex-direction: row;
    list-style: none;
    height: 100%;
    padding-left: 10px;
    padding-right: 10px;
  }

  .paint-item {
    background: var(--button-primary-color);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 60px;
    height: 100%;
  }

  .paint-item input {
    background: none;
    height: 100%;
    border: none;
  }

  .paint-item:hover {
    background-color: var(--button-secondary-color);
  }
</style>
