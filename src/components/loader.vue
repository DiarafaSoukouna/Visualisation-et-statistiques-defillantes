<template>
  <div class="bloc-modale">
    <div class="overlay"></div>
    <div class="container-fluid">
      <div class="container">
        <div class="row">
          <div class="col-md-12">
            <div class="pulse-container">
              <img src="../assets/logo_mobile.png" alt="" class="pulse-image" />
            </div>
          </div>
        </div>
        <br /><br />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DNPMECLPreloader",
  data() {
    return {};
  },
  mounted() {},
  methods: {},
};
</script>

<style lang="css" scoped>
.bloc-modale {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 10px;
  overflow: hidden;
}
.overlay {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.container-fluid {
  padding: 2em 0em 4em 0em;
}
.container {
  padding: 2em 0em 5em 0em;
}

.pulse-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Ajuste selon tes besoins */
}

.pulse-image {
  width: 100px; /* Ajuste selon tes besoins */
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.2);
    opacity: 1;
  }
}
</style>
