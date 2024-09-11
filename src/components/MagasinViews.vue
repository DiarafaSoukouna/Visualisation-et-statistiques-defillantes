<template>
  <div>
    <h1>Magasins</h1>
    <div class="carousel-container">
      <div class="carousel" ref="carousel">
        <div
          v-for="(slide, index) in slides"
          :key="index"
          class="carousel-item"
        >
          <table>
            <thead>
              <tr>
                <th>Nom Magasin</th>
                <th>Capacité</th>
                <th>Préfecture</th>
                <th>Agent de collecte</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(data, idx) in slide" :key="idx">
                <td>{{ data.nom_magasin }}</td>
                <td>{{ data.capacite }}</td>
                <td>{{ data.nom_prefecture }}</td>
                <td>{{ data.nom_collecteur }}</td>
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
import { getAccessToken } from "@/services/authService.js"; // Assume you have an authService.js file

export default {
  data() {
    return {
      slides: [],
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
        const prefecturesData = await this.fetchData(
          "http://92.112.194.154:8000/api/parametrages/localites/prefectures"
        );
        const magasinsData = await this.fetchData(
          "http://92.112.194.154:8000/api/parametrages/magasins"
        );

        const prefectureMap = new Map(
          prefecturesData.map((prefecture) => [
            prefecture.id_prefecture,
            prefecture.nom_prefecture,
          ])
        );

        const magasinsArray = magasinsData.map((magasin) => {
          const nomPrefecture =
            prefectureMap.get(magasin.commune_relation.prefecture) ||
            "Non défini";
          const nomCollecteur = magasin.collecteur_relation
            ? `${magasin.collecteur_relation.nom_collecteur} ${magasin.collecteur_relation.prenom_collecteur}`
            : "Non défini";
          return {
            nom_magasin: magasin.nom_magasin,
            capacite: magasin.capacite,
            nom_prefecture: nomPrefecture,
            nom_collecteur: nomCollecteur,
          };
        });

        const itemsPerPage = 10;
        for (let i = 0; i < magasinsArray.length; i += itemsPerPage) {
          this.slides.push(magasinsArray.slice(i, i + itemsPerPage));
        }
      } catch (error) {
        console.error("Erreur lors du peuplement du carrousel :", error);
      }
    },
    startCarousel() {
      let currentSlide = 0;
      const totalSlides = this.slides.length;
      const slideDuration = 5000; // Duration of each slide in milliseconds

      const showSlide = (index) => {
        this.$refs.carousel.style.transform = `translateX(-${index * 100}%)`;
      };

      const slideInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
      }, slideDuration);

      setTimeout(() => {
        clearInterval(slideInterval); // Stop changing slides
        this.$router.push({ name: "evolution" }); // Adjust the route name as necessary
      }, totalSlides * slideDuration); // Redirect after a full cycle
    },
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

table {
  width: 100%;
  height: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 15px rgba(64, 64, 64, 0.1);
}

th,
td {
  padding: 20px;
  border: 1px solid #ddd;
  text-align: left;
  font-size: 1rem;
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

.carousel-container {
  overflow: hidden;
  position: relative;
  height: calc(100vh - 80px); /* Adjust height to fit header */
}

.carousel {
  display: flex;
  transition: transform 0.5s ease;
}

.carousel-item {
  min-width: 100%;
  box-sizing: border-box;
}
</style>
