<template>
  <div>
    <h1>Tendances des Produits</h1>
    <div class="carousel-container">
      <div class="carousel" ref="carousel">
        <!-- Les items du carrousel seront ajoutés ici via Vue -->
        <div
          v-for="(slide, index) in slides"
          :key="index"
          class="carousel-item"
        >
          <div class="tables-container">
            <table v-for="(produit, prodIndex) in slide" :key="prodIndex">
              <thead>
                <tr>
                  <th>Details</th>
                  <th>Graphique</th>
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
                    <div>{{ produit.nom_produit }}</div>
                  </td>
                  <td>
                    <div
                      :id="'chart-' + index + '-' + prodIndex"
                      style="width: 300px; height: 200px"
                    ></div>
                  </td>
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
import Highcharts from "highcharts";
import exporting from "highcharts/modules/exporting";
import exportData from "highcharts/modules/export-data";
import accessibility from "highcharts/modules/accessibility";
import { getAccessToken } from "@/services/authService.js";

export default {
  data() {
    return {
      slides: [],
    };
  },
  async mounted() {
    exporting(Highcharts);
    exportData(Highcharts);
    accessibility(Highcharts);
    await this.populateCarousel();
  },
  methods: {
    async fetchData(url) {
      const token = await getAccessToken();
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    },
    async populateCarousel() {
      try {
        const produitsData = await this.fetchData(
          "http://92.112.194.154:8000/api/parametrages/produits"
        );
        const evolutionData = await this.fetchData(
          "http://92.112.194.154:8000/api/enquetes/marches-prix/grossistes"
        );
        const slides = [];

        const produitsArray = produitsData
          .filter((produit) => produit.affichage_ecran === true)
          .map((produit) => ({
            nom_produit: produit.nom_produit,
            image: produit.image || "",
            evolution: evolutionData
              .filter(
                (item) =>
                  item.produit_relation.nom_produit === produit.nom_produit
              )
              .map((item) => ({
                date: new Date(item.date_enregistrement).toLocaleDateString(),
                prix: item.prix_unitaire_vente,
              })),
          }))
          .filter((produit) => produit.evolution.length > 0);

        const itemsPerPage = 2;
        for (let i = 0; i < produitsArray.length; i += itemsPerPage) {
          const slideItems = produitsArray.slice(i, i + itemsPerPage);
          slides.push(slideItems);

          // Dessiner les graphiques pour chaque produit
          slideItems.forEach(async (produit, index) => {
            const dernierPrixData = await this.fetchData(
              `http://92.112.194.154:8000/api/parametrages/marches/prix-dernier/produit-marche?type=PRODUIT&name=${produit.nom_produit}`
            );
            this.drawChart(
              `chart-${Math.floor(i / itemsPerPage)}-${index}`,
              produit.evolution,
              dernierPrixData
            );
          });
        }

        this.slides = slides;

        // Navigation du carrousel
        this.$nextTick(() => {
          let currentSlide = 0;
          const totalSlides = this.slides.length;

          const showSlide = (index) => {
            if (this.$refs.carousel) {
              this.$refs.carousel.style.transform = `translateX(-${
                index * 100
              }%)`;
            }
          };

          showSlide(currentSlide); // Affiche la première slide

          setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
          }, 5000);
        });
      } catch (error) {
        console.error("Erreur lors du peuplement du carrousel :", error);
      }
    },
    drawChart(containerId, data, dernierPrixData) {
      const dernierPrix = dernierPrixData.prix_kg;
      const dernierDate = new Date(
        dernierPrixData.date_enquete
      ).toLocaleDateString();

      const fullData = [...data, { date: dernierDate, prix: dernierPrix }];

      Highcharts.chart(containerId, {
        chart: {
          type: "line",
        },
        title: {
          text: "Prix unitaire vente au fil du temps",
        },
        xAxis: {
          categories: fullData.map((item) => item.date),
          title: {
            text: "Date",
          },
        },
        yAxis: {
          title: {
            text: "Prix Unitaire Vente",
          },
        },
        series: [
          {
            name: "Prix",
            data: fullData.map((item) => item.prix),
          },
        ],
      });
    },
  },
};
</script>

<style scoped>
/* Styling adjustments for table layout and charts */
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
