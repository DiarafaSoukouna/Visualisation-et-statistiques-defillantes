<template>
  <Loader v-if="isLoading"></Loader>
  <div>
    <div class="carousel-container">
      <div class="carousel" ref="carousel">
        <div
          v-for="(slide, index) in carouselSlides"
          :key="index"
          class="carousel-item"
        >
          <h1>
            <span style="color: #e9bc18">REGION :</span>
            {{ toUpperCase(slide.region) }}
            <span style="color: #e9bc18">FAMILLE :</span>
            {{ toUpperCase(slide.famille) }}
          </h1>

          <table>
            <thead>
              <tr>
                <th rowspan="2">Nom marché</th>
                <th>Date</th>
                <th v-for="product in filteredProducts" :key="product">
                  {{ product }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in slide.groupedMarches" :key="idx">
                <td>{{ item.nom_marche }}</td>
                <td>
                  <div class="date-container">
                    <span>{{ item.dateEnquete }}</span>
                    <!-- <hr class="date-separator" /> -->
                    <span>{{ item.dateDernier }}</span>
                  </div>
                </td>
                <td v-for="product in filteredProducts" :key="product">
                  <div
                    style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                    "
                  >
                    <div
                      style="
                        display: flex;
                        flex-direction: column;
                        text-align: left;
                      "
                    >
                      <span>
                        {{ item.prixProduit[product]?.prix_enquete || "-" }}
                      </span>
                      <span>
                        {{ item.prixProduit[product]?.dernierprix || "-" }}
                      </span>
                    </div>
                    <div style="text-align: right; padding-left: 10px">
                      <span>
                        {{
                          calculateEvolution(
                            item.prixProduit[product]?.prix_enquete,
                            item.prixProduit[product]?.dernierprix
                          )
                        }}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Loader from "@/components/loader.vue";
export default {
  components: {
    Loader,
  },
  data() {
    return {
      groupedMarches: [],
      carouselSlides: [],
      currentSlide: 0,
      slideInterval: null,
      uniqueProducts: [],
      produitPhares: [],
      isLoading: true,
    };
  },
  computed: {
    generateSlides() {
      const slides = [];
      for (const [region, familles] of Object.entries(this.groupedMarches)) {
        for (const [famille, marches] of Object.entries(familles)) {
          slides.push({
            region,
            famille,
            groupedMarches: marches,
          });
        }
      }
      return slides;
    },
    filteredProducts() {
      const currentFamille = this.carouselSlides[this.currentSlide]?.famille;
      if (!currentFamille) return [];

      return this.uniqueProducts[currentFamille]
        .filter((product) =>
          this.produitPhares.some(
            (produitPhare) => produitPhare.nom_produit === product
          )
        )
        .slice(0, 8); // Limite à 8 produits
    },
  },
  async mounted() {
    await this.populateCarousel();
    this.carouselSlides = this.generateSlides;
    this.startCarousel();
  },
  beforeUnmount() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  },
  methods: {
    toUpperCase(text) {
      return text.toUpperCase();
    },
    formatDate(dateString) {
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      return new Date(dateString).toLocaleDateString("fr-FR", options);
    },
    async fetchData(url) {
      try {
        const response = await axios.get(url);
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        return [];
      }
    },
    async populateCarousel() {
      try {
        const enquetesData = await this.fetchData(
          "https://cors-proxy.fringe.zone/http://92.112.194.154:8000/api/enquetes/marches-prix/tous-prix-produit/par-famille"
        );
        this.produitPhares = await this.fetchData(
          "https://cors-proxy.fringe.zone/http://92.112.194.154:8000/api/parametrages/produits/produits/les-plus-consommer"
        );

        const grouped = {};
        const productsByFamily = {};

        for (const enquete of enquetesData) {
          for (const produit of enquete.produits) {
            const prices = produit.prices;
            const premierPrix = prices[0] ? prices[0].prix_kg : null;
            const deuxiemePrix = prices[1] ? prices[1].prix_kg : null;
            const datePremier = prices[0] ? prices[0].date_enquete : null;
            const dateDeuxieme = prices[1] ? prices[1].date_enquete : null;

            for (const price of prices) {
              const region = price.region || "Non défini";
              const famille = enquete.famille || "Non défini";
              const nomProduit = price.produit || "Non défini";
              const idMarche = price.marche;

              // Regrouper les produits par famille
              if (!productsByFamily[famille]) {
                productsByFamily[famille] = new Set();
              }
              productsByFamily[famille].add(nomProduit);

              if (!grouped[region]) {
                grouped[region] = {};
              }
              if (!grouped[region][famille]) {
                grouped[region][famille] = [];
              }

              let existingMarket = grouped[region][famille].find(
                (m) => m.nom_marche === idMarche
              );

              if (!existingMarket) {
                existingMarket = {
                  id_marche: idMarche,
                  nom_marche: price.marche || "Non défini",
                  dateDernier: dateDeuxieme ? dateDeuxieme : null,
                  dateEnquete: datePremier ? datePremier : null,
                  prixProduit: {},
                };
                grouped[region][famille].push(existingMarket);
              }

              existingMarket.prixProduit[nomProduit] = {
                dernierprix: premierPrix,
                prix_enquete: deuxiemePrix,
                dateDernier: dateDeuxieme ? dateDeuxieme : null,
                dateEnquete: datePremier ? datePremier : null,
              };
            }
          }
        }

        // Convertir les Sets en tableaux
        for (const famille in productsByFamily) {
          productsByFamily[famille] = Array.from(productsByFamily[famille]);
        }

        this.groupedMarches = grouped;
        this.uniqueProducts = productsByFamily;
        this.isLoading = false;
      } catch (error) {
        console.error("Erreur lors du peuplement du carrousel :", error);
      }
    },
    calculateEvolution(currentPrice, lastPrice) {
      const current = parseFloat(currentPrice) || 0;
      const last = parseFloat(lastPrice) || 0;
      if (last === 0) return "-%";
      const evolution = ((current - last) / last) * 100;
      return `${evolution.toFixed(2)}%`;
    },
    startCarousel() {
      const totalSlides = this.carouselSlides.length;
      const slideDuration = 7000;
      const slideWidth = 100;

      if (totalSlides === 0) return;

      this.slideInterval = setInterval(() => {
        if (this.$refs.carousel) {
          this.currentSlide = (this.currentSlide + 1) % totalSlides;
          this.$refs.carousel.style.transform = `translateX(-${
            this.currentSlide * slideWidth
          }%)`;

          if (this.currentSlide === 0) {
            setTimeout(() => {
              this.$refs.carousel.style.transition = "none";
              this.$refs.carousel.style.transform = `translateX(0)`;
              setTimeout(() => {
                this.$refs.carousel.style.transition = "transform 1s ease";
              }, 20);
            }, slideDuration);
          }
        }
      }, slideDuration);
    },
  },
};
</script>

<style scoped>
.carousel-container {
  overflow: hidden;
  width: 100%;
  background-color: #fff;
}

.carousel {
  display: flex;
  gap: 0px;
  transition: transform 1s ease;
  height: auto;
}

.carousel-item {
  flex: 0 0 100%;
}

.highlight {
  color: #e9bc18;
}

.carousel table {
  border-collapse: collapse;
  width: 100%;
  background-color: #fff;
  margin-top: 10px;
}
.date-separator {
  border-top: 1px solid #000;
  margin: 5px 0;
}
h1 {
  margin: 20px 0;
  text-align: center;
  font-size: 2.5rem;
  color: #369f4a;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

th,
td {
  border: 1px solid black;
  padding: 8px 12px;
  text-align: center;
}

th {
  background-color: #4caf50;
  color: white;
}
.date-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.date-cell span {
  display: block;
}
.date-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.date-container span {
  margin: 2px 0; /* Adds spacing between dates */
}
.carousel th,
.carousel td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
}

.carousel thead {
  background-color: #369f4a;
}

.carousel th {
  font-weight: bold;
  color: #fff;
}

.date-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.price-evolution {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-details {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.evolution {
  text-align: right;
  padding-left: 10px;
}
</style>
