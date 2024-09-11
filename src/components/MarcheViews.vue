<template>
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
            {{ toUpperCase(slide.prefecture) }}
            <span style="color: #e9bc18">CATEGORIE :</span>
            {{ toUpperCase(slide.famille) }}
          </h1>

          <table>
            <thead>
              <tr>
                <th>Nom marché</th>
                <th>Date</th>
                <!-- Nouvelle colonne pour la date -->
                <!-- Génère les en-têtes des colonnes dynamiquement pour les produits -->
                <th
                  v-for="product in uniqueProducts.slice(0, 8)"
                  :key="product"
                >
                  {{ product }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in slide.groupedMarches" :key="idx">
                <td>{{ item.nom_marche }}</td>
                <td>{{ formatDate(item.date_enregistrement) }}</td>
                <!-- Affichage de la date -->
                <!-- Affiche les prix des produits pour le marché courant -->
                <td
                  v-for="product in uniqueProducts.slice(0, 8)"
                  :key="product"
                >
                  {{ item.prixProduit[product] || "-" }}
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
import { getAccessToken } from "@/services/authService.js";

// Fonction pour formater la date
function formatDate(dateString) {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return new Date(dateString).toLocaleDateString("fr-FR", options);
}

export default {
  data() {
    return {
      groupedMarches: [],
      carouselSlides: [],
      currentSlide: 0,
      slideInterval: null,
      uniqueProducts: [], // Ajout d'un tableau pour stocker les noms des produits uniques
    };
  },
  computed: {
    generateSlides() {
      const slides = [];
      for (const [prefecture, familles] of Object.entries(
        this.groupedMarches
      )) {
        for (const [famille, marches] of Object.entries(familles)) {
          slides.push({
            prefecture,
            famille,
            groupedMarches: marches,
          });
        }
      }
      return slides;
    },
  },
  async mounted() {
    await this.populateCarousel();
    this.carouselSlides = this.generateSlides;
    this.$nextTick(() => {
      this.startCarousel();
    });
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
      return formatDate(dateString);
    },
    async fetchData(url) {
      const token = await getAccessToken();
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
        const marchesData = await this.fetchData(
          "http://92.112.194.154:8000/api/parametrages/marches"
        );
        const enquetesData = await this.fetchData(
          "http://92.112.194.154:8000/api/enquetes/marches-prix/consommations"
        );
        const famillesData = await this.fetchData(
          "http://92.112.194.154:8000/api/parametrages/familles"
        );

        const prefectureMap = new Map();
        prefecturesData.forEach((prefecture) => {
          prefectureMap.set(
            prefecture.id_prefecture,
            prefecture.nom_prefecture
          );
        });

        const grouped = {};
        const productsSet = new Set(); // Set pour collecter les produits uniques

        for (const enquete of enquetesData) {
          const marche = marchesData.find(
            (m) => m.id_marche === enquete.enquete_relation.marche
          );
          const famille = famillesData.find(
            (f) =>
              f.id_famille_produit === enquete.produit_relation.famille_produit
          );

          const nomPrefecture =
            prefectureMap.get(marche?.commune_relation?.prefecture) ||
            "Non défini";
          const nomFamille = famille
            ? famille.nom_famille_produit
            : "Non défini";
          const nomProduit =
            enquete.produit_relation.nom_produit || "Non défini";
          const idMarche = marche?.id_marche;

          productsSet.add(nomProduit); // Ajout du produit au Set

          if (!grouped[nomPrefecture]) {
            grouped[nomPrefecture] = {};
          }
          if (!grouped[nomPrefecture][nomFamille]) {
            grouped[nomPrefecture][nomFamille] = [];
          }

          let existingMarket = grouped[nomPrefecture][nomFamille].find(
            (m) => m.id_marche === idMarche
          );

          if (existingMarket) {
            existingMarket.prixProduit[nomProduit] = enquete.prix_fg_kg;
          } else {
            grouped[nomPrefecture][nomFamille].push({
              id_marche: idMarche,
              nom_marche: marche ? marche.nom_marche : "Non défini",
              date_enregistrement: enquete.date_enregistrement, // Ajout de la date
              prixProduit: {
                [nomProduit]: enquete.prix_fg_kg,
              },
            });
          }
        }

        this.groupedMarches = grouped;
        this.uniqueProducts = Array.from(productsSet).slice(0, 7); // Limitation des produits uniques à 8
      } catch (error) {
        console.error("Erreur lors du peuplement du carrousel :", error);
      }
    },
    async getDernierPrix(nomProduit, id_marche) {
      try {
        const data = await this.fetchData(
          `http://92.112.194.154:8000/api/parametrages/marches/prix-dernier/produit-marche?type=PRODUIT&name=${nomProduit}`
        );
        const marcheData = data.find(
          (marche) => marche.id_marche === id_marche
        );

        return marcheData ? marcheData.prix_kg : "Non défini";
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du dernier prix :",
          error
        );
        return "Non défini";
      }
    },
    startCarousel() {
      const totalSlides = this.carouselSlides.length;
      const slideDuration = 5000;

      if (totalSlides === 0) return;

      this.slideInterval = setInterval(() => {
        if (this.$refs.carousel) {
          this.currentSlide = (this.currentSlide + 1) % totalSlides;
          this.$refs.carousel.style.transform = `translateX(-${
            this.currentSlide * 100
          }%)`;
        }
      }, slideDuration);
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
  margin: 20px 0;
  text-align: center;
  font-size: 2.5rem; /* Augmenté pour plus de visibilité */
  color: #369f4a;
}

table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 4px 20px rgba(64, 64, 64, 0.15); /* Ombre plus marquée */
}

th,
td {
  padding: 15px; /* Augmenté pour plus d'espace */
  border: 2px solid #ddd; /* Bordure plus épaisse */
  text-align: left;
  font-size: 1rem; /* Augmenté pour une meilleure lisibilité */
}

th {
  background-color: #369f4a;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.1em; /* Espacement des lettres augmenté */
  font-size: 1.1rem; /* Taille de police augmentée */
}

tr:nth-child(even) {
  background-color: #f9f9f9; /* Couleur de fond légèrement modifiée pour une meilleure visibilité */
}

tr:hover {
  background-color: #e2e8f0;
}

th[colspan="10"] {
  text-align: left;
  font-size: 1.1rem; /* Taille de police augmentée pour les en-têtes avec colspan */
}

.carousel-container {
  overflow: hidden;
  position: relative;
  height: auto;
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
