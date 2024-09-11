<template>
  <div class="carousel-container">
    <transition-group name="fade" mode="out-in">
      <component :is="currentComponent" :key="currentComponent"></component>
    </transition-group>
    <div class="carousel-controls">
      <div class="slide-info">
        <span>Slide {{ currentIndex + 1 }} / {{ components.length }}</span>
        <span>Temps restant: {{ remainingTime }}s</span>
      </div>
    </div>
  </div>
</template>

<script>
import Dashboard from "@/components/DashboardViews.vue";
import Prefectures from "@/components/PrefectureViews.vue";
import Produits from "@/components/ProduitViews.vue";
import Marche from "@/components/MarcheViews.vue";
import Evolution from "@/components/EvolutionViews.vue";

export default {
  components: {
    Dashboard,
    Prefectures,
    Produits,
    Marche,
    Evolution,
  },
  data() {
    return {
      components: [
        { name: "Dashboard", duration: 10000 }, // Spécifie le temps d'affichage en millisecondes pour chaque composant
        { name: "Prefectures", duration: 15000 },
        { name: "Produits", duration: 20000 },
        { name: "Marche", duration: 10000 },
        { name: "Evolution", duration: 10000 },
      ],
      currentIndex: 0, // Index du composant actuellement affiché
      currentTimeout: null, // Référence pour le timeout actuel
      remainingTime: 0, // Temps restant pour la slide actuelle
    };
  },
  computed: {
    currentComponent() {
      return this.components[this.currentIndex].name;
    },
  },
  mounted() {
    const savedIndex = parseInt(localStorage.getItem("carouselIndex"), 10);
    if (!isNaN(savedIndex) && savedIndex < this.components.length) {
      this.currentIndex = savedIndex;
    }
    this.startCarousel();
  },
  methods: {
    startCarousel() {
      this.updateRemainingTime();
      this.currentTimeout = setTimeout(() => {
        this.nextComponent();
      }, this.remainingTime * 1000); // Convertir les secondes en millisecondes
    },
    nextComponent() {
      localStorage.setItem("carouselIndex", this.currentIndex);

      clearTimeout(this.currentTimeout);

      this.currentIndex = (this.currentIndex + 1) % this.components.length;

      this.startCarousel();
    },
    updateRemainingTime() {
      this.remainingTime = this.components[this.currentIndex].duration / 1000; // Convertir les millisecondes en secondes
      this.timeUpdateInterval = setInterval(() => {
        this.remainingTime -= 1;
        if (this.remainingTime <= 0) {
          clearInterval(this.timeUpdateInterval);
        }
      }, 1000); // Mettre à jour toutes les secondes
    },
  },
  beforeMount() {
    clearTimeout(this.currentTimeout);
    clearInterval(this.timeUpdateInterval);
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

.carousel-controls {
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: white;
}

.slide-info {
  font-size: 14px;
}
</style>
