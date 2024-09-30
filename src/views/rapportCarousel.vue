<template>
  <div class="carousel-container">
    <!-- Informations sur le numéro de la slide et le temps restant -->
    <div class="slide-info">
      <span>Slide {{ currentIndex + 1 }} / {{ components.length }}</span>
      <span>Temps restant : {{ remainingTime }}s</span>
    </div>
    <!-- Transition du composant en cours -->
    <transition
      name="fade"
      @before-enter="beforeEnter"
      @enter="enter"
      @leave="leave"
    >
      <component :is="currentComponent" :key="currentIndex"></component>
    </transition>
  </div>
</template>

<script>
// import Dashboard from "@/components/DashboardViews.vue";
import Marche from "@/components/MarcheViews.vue";
import Partenaire from "@/components/PartenaireViews.vue";
import Produit from "@/components/ProduitViews.vue";
import Evolution from "@/components/EvolutionViews.vue";
import Video from "@/components/VideoViews.vue";
import CarouselItem from "@/components/CarouselItemViews.vue";

export default {
  components: {
    Marche,
    Partenaire,
    Produit,
    Evolution,
    Video,
    CarouselItem,
  },
  data() {
    return {
      components: [
        { name: "Video", duration: 60000 },
        { name: "Marche", duration: 60000 },
        { name: "Partenaire", duration: 10000 },
        { name: "Produit", duration: 40000 },
        { name: "Evolution", duration: 75000 },
        { name: "CarouselItem", duration: 60000 },
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
    this.preloadComponents().then(() => {
      this.startCarousel();
    });
  },
  methods: {
    async preloadComponents() {
      // Charge tous les composants pour éviter les transitions étranges
      const promises = this.components.map((component) => {
        return import(`@/components/${component.name}Views.vue`);
      });
      await Promise.all(promises);
    },
    startCarousel() {
      this.updateRemainingTime();
      this.currentTimeout = setTimeout(() => {
        this.nextComponent();
      }, this.remainingTime * 1000);
    },
    nextComponent() {
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
    beforeEnter(el) {
      el.style.opacity = 0;
    },
    enter(el, done) {
      el.offsetHeight; // Trigger reflow
      el.style.transition = "opacity 1s";
      el.style.opacity = 1;
      done();
    },
    leave(el, done) {
      el.style.transition = "opacity 1s";
      el.style.opacity = 0;
      done();
    },
  },
  beforeUnmount() {
    clearTimeout(this.currentTimeout);
    clearInterval(this.timeUpdateInterval);
  },
};
</script>

<style scoped>
.carousel-container {
  position: relative;
  height: 100%;
  overflow: hidden; /* Assure que le contenu excédentaire est caché */
}

.carousel-wrapper {
  display: flex;
  transition: transform 1s ease-in-out;
  /* Assure que la transition est fluide */
}

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

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 1s, transform 1s;
}

.slide-fade-enter,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
