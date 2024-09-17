<template>
  <div class="carousel-container">
    <!-- Informations sur le numéro de la slide et le temps restant -->
    <div class="slide-info">
      <span>Slide {{ currentIndex + 1 }} / {{ components.length }}</span>
      <span>Temps restant : {{ remainingTime }}s</span>
    </div>
    <!-- Transition du composant en cours -->
    <transition-group name="fade" mode="out-in">
      <component :is="currentComponent" :key="currentComponent"></component>
    </transition-group>
  </div>
</template>

<script>
import Dashboard from "@/components/DashboardViews.vue";
import Marche from "@/components/MarcheViews.vue";
import Partenaire from "@/components/PartenaireViews.vue";
import Produit from "@/components/ProduitViews.vue";
import Pourcentage from "@/components/PourcentageViews.vue";
export default {
  components: {
    Dashboard,
    Marche,
    Partenaire,
    Produit,
    Pourcentage,
  },
  data() {
    return {
      components: [
        { name: "Dashboard", duration: 10000 },
        { name: "Marche", duration: 40000 },
        { name: "Partenaire", duration: 10000 },
        { name: "Produit", duration: 60000 },
        { name: "Pourcentage", duration: 10000 },
      ],
      currentIndex: 0,
      currentTimeout: null,
      remainingTime: 0,
      timeUpdateInterval: null,
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
      }, this.remainingTime * 1000);
    },
    nextComponent() {
      localStorage.setItem("carouselIndex", this.currentIndex);
      clearTimeout(this.currentTimeout);
      clearInterval(this.timeUpdateInterval);

      this.currentIndex = (this.currentIndex + 1) % this.components.length;

      this.startCarousel();
    },
    updateRemainingTime() {
      this.remainingTime = this.components[this.currentIndex].duration / 1000;
      this.timeUpdateInterval = setInterval(() => {
        this.remainingTime -= 1;
        if (this.remainingTime <= 0) {
          clearInterval(this.timeUpdateInterval);
        }
      }, 1000);
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
  display: flex;
  flex-direction: column;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* Positionnement des informations de la slide en haut */
.slide-info {
  position: absolute;
  top: 5px;
  left: 10px;
  font-size: 12px; /* Format réduit pour être discret */
  color: rgba(0, 0, 0, 0.7); /* Couleur légèrement transparente */
  background: rgba(
    255,
    255,
    255,
    0.6
  ); /* Fond transparent pour une meilleure visibilité */
  padding: 5px 10px;
  border-radius: 5px;
}
</style>
