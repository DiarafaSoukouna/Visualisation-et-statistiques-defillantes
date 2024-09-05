<template>
  <div>
    <h1>Préfectures et Commerces</h1>
    <div class="carousel-container">
      <div
        class="carousel"
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
      >
        <div
          class="carousel-item"
          v-for="(slide, index) in slides"
          :key="index"
        >
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Region</th>
                <th>Nombre de Magasins</th>
                <th>Nombre de Marchés</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(data, idx) in slide" :key="idx">
                <td>{{ data.nom }}</td>
                <td>{{ data.region }}</td>
                <td>{{ data.magasins }}</td>
                <td>{{ data.marches }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAccessToken } from "@/services/authService.js";
import axios from "axios";

export default {
  data() {
    return {
      accessToken: null,
      slides: [],
      currentSlide: 0,
    };
  },
  async mounted() {
    this.accessToken = await getAccessToken();
    if (this.accessToken) {
      this.populateCarousel();
      this.startCarousel();
    }
  },
  methods: {
    async fetchData(url) {
      try {
        const response = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
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
        const marchesData = await this.fetchData(
          "http://92.112.194.154:8000/api/parametrages/marches"
        );

        const prefectureMap = new Map();

        prefecturesData.forEach((prefecture) => {
          prefectureMap.set(prefecture.id_prefecture, {
            nom: prefecture.nom_prefecture,
            region: prefecture.region_relation.nom_region,
            magasins: 0,
            marches: 0,
          });
        });

        magasinsData.forEach((magasin) => {
          const prefectureId = magasin.commune_relation.prefecture;
          if (prefectureMap.has(prefectureId)) {
            prefectureMap.get(prefectureId).magasins += 1;
          }
        });

        marchesData.forEach((marche) => {
          const prefectureId = marche.commune_relation.prefecture;
          if (prefectureMap.has(prefectureId)) {
            prefectureMap.get(prefectureId).marches += 1;
          }
        });

        const prefecturesArray = Array.from(prefectureMap.values());
        const itemsPerPage = 10;

        this.slides = [];
        for (let i = 0; i < prefecturesArray.length; i += itemsPerPage) {
          this.slides.push(prefecturesArray.slice(i, i + itemsPerPage));
        }
      } catch (error) {
        console.error("Erreur lors du peuplement du carrousel :", error);
      }
    },
    startCarousel() {
      setInterval(() => {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
      }, 5000); // Change toutes les 5 secondes
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

.carousel-container {
  overflow: hidden;
  position: relative;
  height: calc(100vh - 80px);
}

.carousel {
  display: flex;
  transition: transform 0.5s ease;
}

.carousel-item {
  min-width: 100%;
  box-sizing: border-box;
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
</style>
