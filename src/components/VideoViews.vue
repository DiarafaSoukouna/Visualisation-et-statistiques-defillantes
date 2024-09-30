<template>
  <div class="video-container">
    <video autoplay muted loop>
      <source src="../assets/video.mp4" type="video/mp4" />
      Votre navigateur ne supporte pas la lecture de vidéos HTML5.
    </video>
  </div>
</template>

<script>
export default {
  name: "FullScreenVideo",
};
</script>

<style scoped>
.video-container {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

video {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: translate(-50%, -50%);
}
</style>
