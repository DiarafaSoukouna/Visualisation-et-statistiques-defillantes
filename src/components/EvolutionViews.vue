<template>
  <Loader v-if="isLoading"></Loader>
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
import Loader from "@/components/loader.vue";
import Highcharts from "highcharts";
import exporting from "highcharts/modules/exporting";
import exportData from "highcharts/modules/export-data";
import accessibility from "highcharts/modules/accessibility";
import axios from "axios";

exporting(Highcharts);
exportData(Highcharts);
accessibility(Highcharts);

export default {
  component: {
    Loader,
  },
  data() {
    return {
      produitsParFamille: {},
      currentIndex: 0,
      isLoading: true,
    };
  },
  name: "HighchartsComponent",
  mounted() {
    this.populateData();
    this.startCarousel();
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

    async populateData() {
      const apiUrl =
        "https://cors-proxy.fringe.zone/http://92.112.194.154:8000/api/enquetes/marches-prix/tous-prix-produit/par-famille";
      try {
        const data = await this.fetchData(apiUrl);
        const produitsParFamille = {};

        data.forEach((famille) => {
          const familleNom = famille.famille;
          // Limiter à 5 produits par famille
          const produitsLimites = famille.produits.slice(0, 7);

          produitsLimites.forEach((produit) => {
            const produitNom = produit.produit.nom_produit;
            const codeProduit = produit.produit.code_produit;
            const prixData = produit.prices.map((price) => ({
              prix: price.prix_kg,
              date: new Date(price.date_enquete).toLocaleDateString("fr-FR"),
            }));

            if (!produitsParFamille[familleNom]) {
              produitsParFamille[familleNom] = {};
            }

            produitsParFamille[familleNom][codeProduit] = {
              nom: produitNom,
              data: prixData.slice(0, 5), // Limiter à 5 valeurs par produit
            };
          });
        });

        this.produitsParFamille = produitsParFamille;
        this.renderChart();
        this.isLoading = false;
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

        for (const familleNom in this.produitsParFamille) {
          const produits = this.produitsParFamille[familleNom];

          const seriesData = Object.keys(produits).map((codeProduit) => ({
            name: produits[codeProduit].nom,
            data: produits[codeProduit].data.map((item) => item.prix),
          }));

          const dates = produits[Object.keys(produits)[0]].data.map(
            (item) => item.date
          );

          const containerId = `chart-container-${familleNom}`;
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
              text: `Groupe de produit : ${familleNom}`,
              style: {
                fontSize: "32px",
              },
            },
            xAxis: {
              categories: dates,
              title: {
                text: "Dates d'enquêtes",
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
      }, 15000);
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
  width: 1000px;
  height: 500px;
}
</style>
