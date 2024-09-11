<template>
  <div>
    <h1>Produits</h1>
    <div class="carousel-container">
      <div class="carousel" ref="carousel">
        <div
          v-for="(slide, index) in slides"
          :key="index"
          class="carousel-item"
        >
          <div class="tables-container">
            <table v-for="(produit, idx) in slide" :key="idx">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Nom</th>
                  <th>Famille</th>
                  <th>Catégorie</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <img
                      :src="produit.image"
                      :alt="produit.nom_produit"
                      class="product-image"
                    />
                  </td>
                  <td>{{ produit.nom_produit }}</td>
                  <td>{{ produit.famille_produit }}</td>
                  <td>{{ produit.categorie_produit }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { getAccessToken } from "@/services/authService.js"; // Assuming you have an authService.js file

export default {
  data() {
    return {
      slides: [],
      intervalId: null, // To store the interval ID for cleanup
    };
  },
  async mounted() {
    await this.populateCarousel();
    this.startCarousel();
  },
  methods: {
    async fetchData(url) {
      const token = await getAccessToken(); // Obtain access token
      try {
        const response = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        return [];
      }
    },
    async populateCarousel() {
      try {
        const produitsData = await this.fetchData(
          "http://92.112.194.154:8000/api/parametrages/produits"
        );
        const categoriesData = await this.fetchData(
          "http://92.112.194.154:8000/api/parametrages/categories"
        );
        const famillesData = await this.fetchData(
          "http://92.112.194.154:8000/api/parametrages/familles"
        );

        const categoriesMap = new Map(
          categoriesData.map((categorie) => [
            categorie.id_categorie_produit,
            categorie.nom_categorie_produit,
          ])
        );

        const famillesMap = new Map(
          famillesData.map((famille) => [
            famille.id_famille_produit,
            famille.nom_famille_produit,
          ])
        );

        const produitsArray = produitsData
          .filter((produit) => produit.affichage_ecran === true)
          .map((produit) => ({
            nom_produit: produit.nom_produit,
            famille_produit:
              famillesMap.get(produit.famille_produit) || "Non défini",
            categorie_produit:
              categoriesMap.get(produit.categorie_produit) || "Non défini",
            image: produit.image || "",
          }));

        const itemsPerPage = 2;
        for (let i = 0; i < produitsArray.length; i += itemsPerPage) {
          this.slides.push(produitsArray.slice(i, i + itemsPerPage));
        }
      } catch (error) {
        console.error("Erreur lors du peuplement du carrousel :", error);
      }
    },
    startCarousel() {
      let currentSlide = 0;
      const slideDuration = 5000; // Duration of each slide in milliseconds

      // Use nextTick to ensure the carousel is rendered
      this.$nextTick(() => {
        const totalSlides = this.$refs.carousel
          ? this.$refs.carousel.children.length
          : 0;

        if (totalSlides === 0) {
          console.error("No slides available for the carousel.");
          return;
        }

        this.intervalId = setInterval(() => {
          currentSlide = (currentSlide + 1) % totalSlides;

          // Check if the carousel ref exists before accessing its style
          if (this.$refs.carousel) {
            this.$refs.carousel.style.transform = `translateX(-${
              currentSlide * 100
            }%)`;
          } else {
            console.error("Carousel element not found.");
            clearInterval(this.intervalId); // Stop the interval if the element is missing
          }
        }, slideDuration);
      });
    },
  },
  unmounted() {
    // Clear the interval to prevent errors when the component is destroyed
    if (this.intervalId) {
      clearInterval(this.intervalId);
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

h1 {
  margin: 0;
  padding: 20px;
  background-color: #e9bc18;
  color: #ffffff;
  text-align: center;
  font-size: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.carousel-container {
  overflow: hidden;
  height: calc(100vh - 80px);
  padding: 20px;
  box-sizing: border-box;
}

.carousel {
  display: flex;
  transition: transform 0.5s ease;
}

.carousel-item {
  display: flex;
  min-width: 100%;
  box-sizing: border-box;
  gap: 20px;
  padding: 20px;
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
}

th,
td {
  padding: 20px;
  border: 1px solid #ddd;
  text-align: left;
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

.product-image {
  max-width: 120px;
  max-height: 120px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 15px rgba(64, 64, 64, 0.1);
}
</style>
