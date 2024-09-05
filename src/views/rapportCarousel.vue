<template>
  <div class="carousel-container">
    <transition-group name="fade" mode="out-in">
      <component :is="currentComponent" :key="currentComponent"></component>
    </transition-group>
  </div>
</template>

<script>
import Dashboard from "@/components/DashboardViews.vue"; // Assurez-vous que le chemin est correct
import Prefectures from "@/components/PrefectureViews.vue"; // Assurez-vous que le chemin est correct

export default {
  components: {
    Dashboard,
    Prefectures,
  },
  data() {
    return {
      components: ["Dashboard", "Prefectures"], // Noms des composants à afficher dans le carrousel
      currentIndex: 0, // Index du composant actuellement affiché
    };
  },
  computed: {
    currentComponent() {
      return this.components[this.currentIndex];
    },
  },
  mounted() {
    this.startCarousel();
  },
  methods: {
    startCarousel() {
      setInterval(() => {
        // Bascule vers le prochain composant
        this.currentIndex = (this.currentIndex + 1) % this.components.length;
      }, 10000); // Intervalle de 10 secondes (10000 ms)
    },
  },
};
</script>

<style scoped>
.carousel-container {
  position: relative;
  height: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
