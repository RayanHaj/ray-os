<template>
  <div class="content">
    {{ soundDetails }}
  </div>
</template>
<script>
export default {
  name: "file-explorer-window",
  data() {
    return {
      backendUrl: 'http://localhost:3000',
      soundId: 456123,
      soundDetails: null,
    }
  },

  mounted() {
    fetch(`${this.backendUrl}/api/sounds?id=${this.soundId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => this.soundDetails = data)
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
          this.soundDetails = { error: error.message };
        });
  }
}
</script>
<style>

</style>