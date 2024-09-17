<template>
  <div class="carousel-container">
    <div class="carousel">
      <div
        v-for="(familleId, index) in Object.keys(produitsParFamille)"
        :key="familleId"
        class="carousel-item"
        v-show="index === currentIndex"
      >
        <div :id="'chart-container-' + familleId" class="chart-container"></div>
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
import axios from "axios";

exporting(Highcharts);
exportData(Highcharts);
accessibility(Highcharts);

export default {
  data() {
    return {
      produit_conso: [],
      famille: [],
      enquete: [],
      produitsParFamille: {},
      currentIndex: 0,
    };
  },
  name: "HighchartsComponent",
  mounted() {
    this.populateData();
    this.startCarousel();
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
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        return [];
      }
    },

    async populateData() {
      const endpoints = [
        "http://92.112.194.154:8000/api/parametrages/produits/produits/les-plus-consommer/",
        "http://92.112.194.154:8000/api/enquetes/marches-prix/consommations",
        "http://92.112.194.154:8000/api/parametrages/familles",
      ];

      try {
        const [produit_conso, enquete, famille] = await axios.all(
          endpoints.map((endpoint) => this.fetchData(endpoint))
        );

        this.produit_conso = produit_conso;
        this.enquete = enquete;
        this.famille = famille;

        const produitsParFamille = {};

        // Organisation des données avec prix et dates d'enregistrement
        this.enquete.forEach((item) => {
          const codeProduit = item.produit_relation?.code_produit;
          const nomProduit = item.produit_relation?.nom_produit; // Nom du produit
          const idFamilleProduit = item.produit_relation?.famille_produit;
          const prix = item.prix_fg_kg;
          const dateEnregistrement = item.date_enregistrement; // Date d'enregistrement du prix

          if (codeProduit && idFamilleProduit) {
            if (!produitsParFamille[idFamilleProduit]) {
              produitsParFamille[idFamilleProduit] = {};
            }

            if (!produitsParFamille[idFamilleProduit][codeProduit]) {
              produitsParFamille[idFamilleProduit][codeProduit] = {
                nom: nomProduit,
                data: [],
              };
            }

            // Ajout du prix et de la date d'enregistrement dans le tableau du produit
            produitsParFamille[idFamilleProduit][codeProduit].data.push({
              prix,
              date: new Date(dateEnregistrement).toLocaleDateString("fr-FR"),
            });
          }
        });

        // Limiter à 5 valeurs par produit
        for (const familleId in produitsParFamille) {
          for (const codeProduit in produitsParFamille[familleId]) {
            produitsParFamille[familleId][codeProduit].data =
              produitsParFamille[familleId][codeProduit].data.slice(0, 5);
          }
        }

        this.produitsParFamille = produitsParFamille;

        this.renderChart();
      } catch (error) {
        console.error("Erreur lors du peuplement des données :", error);
      }
    },

    renderChart() {
      this.$nextTick(() => {
        if (Object.keys(this.produitsParFamille).length === 0) {
          console.error("Aucune donnée trouvée pour les produits par famille.");
          return;
        }

        for (const familleId in this.produitsParFamille) {
          const produits = this.produitsParFamille[familleId];
          const famille =
            this.famille.find(
              (f) => f.id_famille_produit === parseInt(familleId)
            )?.nom_famille_produit || `Famille ${familleId}`;

          const seriesData = Object.keys(produits).map((codeProduit) => ({
            name: produits[codeProduit].nom, // Utiliser le nom du produit
            data: produits[codeProduit].data.map((item) => item.prix), // Récupérer les prix
          }));

          const dates = produits[Object.keys(produits)[0]].data.map(
            (item) => item.date // Récupérer les dates d'enregistrement
          );

          const containerId = `chart-container-${familleId}`;
          const container = document.getElementById(containerId);

          if (!container) {
            console.error(`Le conteneur #${containerId} est introuvable.`);
            continue;
          }

          Highcharts.chart(containerId, {
            chart: {
              type: "line",
            },
            title: {
              text: `Famille de produit - ${famille}`,
            },
            xAxis: {
              categories: dates, // Utiliser les dates d'enregistrement comme catégories
              title: {
                text: "Dates d'enquetes",
              },
            },
            yAxis: {
              title: {
                text: "Prix (kg)",
              },
            },
            plotOptions: {
              line: {
                dataLabels: {
                  enabled: true,
                },
                enableMouseTracking: true,
              },
            },
            series: seriesData,
          });
        }
      });
    },

    startCarousel() {
      setInterval(() => {
        this.currentIndex =
          (this.currentIndex + 1) % Object.keys(this.produitsParFamille).length;
      }, 8000);
    },
  },
};
</script>

<style scoped>
.carousel-container {
  overflow: hidden;
  width: 100%;
  display: flex;
  justify-content: center;
}

.carousel {
  display: flex;
}

.carousel-item {
  min-width: 100%;
  padding: 10px;
}

.chart-container {
  width: 900px;
  height: 500px;
}
</style>
