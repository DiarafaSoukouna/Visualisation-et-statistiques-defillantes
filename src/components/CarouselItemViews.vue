<template>
  <Loader v-if="isLoading"></Loader>
  <div class="carousel-container" ref="carousel">
    <div
      class="carousel"
      :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
    >
      <div
        class="carousel-item"
        v-for="(slide, index) in slides"
        :key="'slide-' + index"
      >
        <h1>
          <span>{{ slide.nom_produit }}</span>
        </h1>

        <div class="content">
          <!-- Tableau -->
          <div class="tableau">
            <section class="table__body">
              <table>
                <thead>
                  <tr>
                    <th>Marchés :</th>
                    <th
                      v-for="(marche, index) in slide.marches"
                      :key="'market-' + index"
                    >
                      {{ marche.marche.nom_marche }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Prix actuel (GNF)</td>
                    <td
                      v-for="(marche, index) in slide.marches"
                      :key="'prix-actuel-' + index"
                    >
                      <template
                        v-if="marche.prices && marche.prices.length > 0"
                      >
                        {{
                          marche.prices[0].prix_kg
                            ? marche.prices[0].prix_kg + " GNF"
                            : "-"
                        }}
                      </template>
                      <template v-else>-</template>
                    </td>
                  </tr>
                  <tr>
                    <td>Date actuelle</td>
                    <td
                      v-for="(marche, index) in slide.marches"
                      :key="'date-actuelle-' + index"
                    >
                      <template
                        v-if="marche.prices && marche.prices.length > 0"
                      >
                        {{
                          marche.prices[0].date_enquete
                            ? dateFormat(marche.prices[0].date_enquete)
                            : "-"
                        }}
                      </template>
                      <template v-else>-</template>
                    </td>
                  </tr>
                  <tr>
                    <td>Prix précédent (GNF)</td>
                    <td
                      v-for="(marche, index) in slide.marches"
                      :key="'prix-precedent-' + index"
                    >
                      <template
                        v-if="marche.prices && marche.prices.length > 1"
                      >
                        {{
                          marche.prices[1].prix_kg
                            ? marche.prices[1].prix_kg + " GNF"
                            : "-"
                        }}
                      </template>
                      <template v-else>-</template>
                    </td>
                  </tr>
                  <tr>
                    <td>Date précédente</td>
                    <td
                      v-for="(marche, index) in slide.marches"
                      :key="'date-precedente-' + index"
                    >
                      <template
                        v-if="marche.prices && marche.prices.length > 1"
                      >
                        {{
                          marche.prices[1].date_enquete
                            ? dateFormat(marche.prices[1].date_enquete)
                            : "-"
                        }}
                      </template>
                      <template v-else>-</template>
                    </td>
                  </tr>
                  <tr>
                    <td>Évolution %</td>
                    <td
                      v-for="(marche, index) in slide.marches"
                      :key="'evolution-' + index"
                    >
                      <template
                        v-if="marche.prices && marche.prices.length > 1"
                      >
                        {{
                          getDifference(
                            marche.prices[0].prix_kg,
                            marche.prices[1].prix_kg
                          )
                        }}
                      </template>
                      <template v-else>-</template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>

          <!-- Image du produit -->
          <div class="product-image-container">
            <img
              v-if="
                !slide.marches ||
                !slide.marches[0] ||
                !slide.marches[0].prices ||
                !slide.marches[0].prices[0].image
              "
              src="@/assets/logo.png"
              alt="slide"
              class="product-image"
            />
            <img
              v-else
              :src="slide.marches[0].prices[0].image"
              alt="slide"
              class="product-image"
            />
          </div>
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
      slides: [],
      currentSlide: 0,
      slideInterval: null,
      isLoading: true,
    };
  },
  methods: {
    async fetchData(url) {
      try {
        const response = await axios.get(url);
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        return [];
      }
    },
    dateFormat(date) {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = String(d.getFullYear());
      return `${day}/${month}/${year}`;
    },
    getDifference(ancien, nouveau) {
      if (
        ancien === undefined ||
        nouveau === undefined ||
        ancien === 0 ||
        nouveau === 0
      ) {
        return 0;
      } else {
        const difference = parseFloat(nouveau) - parseFloat(ancien);
        return ((difference / parseFloat(ancien)) * 100).toFixed(2);
      }
    },
    startCarousel() {
      const slideDuration = 10000; // Intervalle de 5 secondes
      this.slideInterval = setInterval(() => {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length; // Incrémente le slide actuel
      }, slideDuration);
    },
    async populateCarousel() {
      const endpoints = [
        "https://cors-proxy.fringe.zone/http://92.112.194.154:8000/api/parametrages/produits/produits/les-plus-consommer/",
        "https://cors-proxy.fringe.zone/http://92.112.194.154:8000/api/statistiques/prix-moyen-par-region",
        "https://cors-proxy.fringe.zone/http://92.112.194.154:8000/api/enquetes/marches-prix/prix-des-deux-dernieres/par-produit",
      ];
      try {
        const [produit, prix_moy, byproduit] = await axios.all(
          endpoints.map((endpoint) => this.fetchData(endpoint))
        );

        const array1 = produit.filter(
          (produit) => produit.affichage_ecran === 1
        );
        this.slides = array1.filter((produit) =>
          prix_moy.some((p) => p.code_produit === produit.code_produit)
        );

        this.slides = byproduit; // Cette ligne peut être ajustée en fonction de votre logique de données
        this.isLoading = false;
        console.log("slide", this.slides);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
  },
  unmounted() {
    clearInterval(this.slideInterval);
  },
  mounted() {
    this.populateCarousel();
    this.startCarousel();
  },
};
</script>

<style scoped>
body {
  margin: 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f4f4f9;
  color: #333;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.carousel-container {
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;
}

.carousel {
  display: flex;
  transition: transform 0.5s ease-in-out;
  will-change: transform;
}

.carousel-item {
  display: flex;
  flex-direction: column;
  min-width: 100%;
  box-sizing: border-box;
  gap: 20px;
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  margin: 20px 0;
  text-align: center;
  font-size: 2.5rem;
  color: #369f4a;
}

.content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.tableau {
  flex: 1;
}

.product-image-container {
  flex: 0 0 auto;
}

.product-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid #eaeaea;
}

table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 15px rgba(64, 64, 64, 0.1);
  font-size: 1.2rem;
}

th,
td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
}

th {
  background-color: #369f4a;
  color: #ffffff;
  text-transform: uppercase;
}

tr:nth-child(even) {
  background-color: #f8f8f8;
}

tr:hover {
  background-color: #e2e8f0;
}
</style>
