<template>
  <h1>PRIX MOYEN EN FCFA PAR REGION</h1>
  <div v-if="slides && textes && localites">
    <div class="carousel-container">
      <div class="carousel" ref="carousel">
        <div
          class="carousel-item"
          v-for="(slide, index) in slides"
          :key="index"
        >
          <div class="product-details">
            <div class="containerh">
              <h2 class="product-name">{{ slide.nom_produit }}</h2>
            </div>

            <img
              class="product-image"
              :src="slide.image"
              :alt="slide.nom_produit"
            />
          </div>
          <div class="tables-container">
            <section class="table__body">
              <table>
                <thead>
                  <tr>
                    <th rowspan="2">Région</th>
                    <th colspan="3">Prix</th>
                    <th rowspan="2">Marché</th>
                    <th rowspan="2">Date</th>
                  </tr>
                  <tr>
                    <th>Min</th>
                    <th>Max</th>
                    <th>Moy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(region, index) in getFilteredRegions(
                      slide.code_produit
                    )"
                    :key="index"
                  >
                    <td>{{ region.nom_region }}</td>
                    <td>{{ region.prix_min }}</td>
                    <td>{{ region.prix_max }}</td>
                    <td>{{ region.prix_moy }}</td>
                    <td>{{ region.nb_marche }}</td>
                    <td>{{ region.dernier_date }}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { getAccessToken } from "@/services/authService.js";
export default {
  data() {
    return {
      slides: [],
      textes: [],
      localites: [],
      slideInterval: null,
    };
  },

  methods: {
    async fetchData(url) {
      const token = await getAccessToken();
      try {
        const response = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        return [];
      }
    },

    async populateCarousel() {
      const endpoints = [
        "http://92.112.194.154:8000/api/parametrages/produits/produits/les-plus-consommer/",
        "http://92.112.194.154:8000/api/statistiques/prix-moyen-par-region",
        "http://92.112.194.154:8000/api/parametrages/localites/regions",
      ];

      try {
        const [produit, prix_moy, region] = await axios.all(
          endpoints.map((endpoint) => this.fetchData(endpoint))
        );

        this.localites = region;
        this.textes = prix_moy;
        this.slides = produit.filter(
          (item) =>
            item.affichage_ecran === 1 &&
            this.textes.some((prix) => prix.code_produit === item.code_produit)
        );

        this.textes = prix_moy;
        console.log(this.localites, this.slides, this.textes);
      } catch (error) {
        console.error("Erreur lors du peuplement du carrousel :", error);
      }
    },

    getPrix(code_produit, region) {
      return this.textes.find(
        (prix) => prix.code_produit === code_produit && prix.region === region
      );
    },

    getFilteredRegions(code_produit) {
      return this.localites.map((region) => {
        const prix = this.getPrix(code_produit, region.nom_region);
        return {
          nom_region: region.nom_region,
          prix_min: prix ? prix.prix_min : "-",
          prix_max: prix ? prix.prix_max : "-",
          prix_moy: prix ? prix.prix_moy : "-",
          nb_marche: prix ? prix.nb_marche : "-",
          dernier_date: prix ? prix.dernier_date : "-",
        };
      });
    },

    startCarousel() {
      let currentSlide = 0;
      const slideDuration = 8000;

      this.$nextTick(() => {
        const totalSlides = this.$refs.carousel?.children.length || 0;

        if (totalSlides === 0) {
          console.error("Aucun slide disponible pour le carrousel.");
          return;
        }

        this.slideInterval = setInterval(() => {
          currentSlide = (currentSlide + 1) % totalSlides;
          if (this.$refs.carousel) {
            this.$refs.carousel.style.transition = "transform 0.5s ease-in-out";
            this.$refs.carousel.style.transform = `translateX(-${
              currentSlide * 100
            }%)`;
          } else {
            console.error("Élément du carrousel introuvable.");
            clearInterval(this.slideInterval);
          }
        }, slideDuration);
      });
    },
  },

  async mounted() {
    await this.populateCarousel();
    this.startCarousel();
  },

  unmounted() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
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
  min-width: 100%;
  box-sizing: border-box;
  gap: 20px;
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.product-image {
  max-width: 200px;
  max-height: 200px;
  flex-shrink: 0;
  border-radius: 8px;
  border: 1px solid #eaeaea;
}

.product-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.product-name {
  font-size: 1.5rem;
  text-align: center;
  color: #fff;
}
h1 {
  margin: 20px 0;
  text-align: center;
  font-size: 2.5rem; /* Augmenté pour plus de visibilité */
  color: #369f4a;
}
.containerh {
  padding: 5px 12px;
  background-color: #369f4a;
  min-width: 100px;
  max-width: 200px;
  border-radius: 5px;
}

.tables-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 15px rgba(64, 64, 64, 0.1);
  font-size: 1.2rem;
  min-width: 800px;
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
  letter-spacing: 0.05em;
}

tr:nth-child(even) {
  background-color: #f8f8f8;
}

tr:hover {
  background-color: #e2e8f0;
}
</style>
