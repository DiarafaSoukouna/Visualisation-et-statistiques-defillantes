<template>
  <div>
    <h1>Enquêtes sur les marchés et les prix</h1>
    <div id="container"></div>
  </div>
</template>

<script>
import Highcharts from "highcharts";
import Exporting from "highcharts/modules/exporting";
import ExportData from "highcharts/modules/export-data";
import Accessibility from "highcharts/modules/accessibility";
import { getAccessToken } from "@/services/authService.js";
import axios from "axios";

// Initialize Highcharts modules
Exporting(Highcharts);
ExportData(Highcharts);
Accessibility(Highcharts);

export default {
  name: "HighchartsComponent",
  data() {
    return {
      consommations: [],
      collectes: [],
      grossistes: [],
    };
  },
  async mounted() {
    await this.populate();
    this.renderChart();
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
    async populate() {
      const endpoints = [
        "http://92.112.194.154:8000/api/enquetes/marches-prix/consommations",
        "http://92.112.194.154:8000/api/enquetes/marches-prix/collectes",
        "http://92.112.194.154:8000/api/enquetes/marches-prix/grossistes",
      ];

      try {
        const [consommations, collectes, grossistes] = await axios.all(
          endpoints.map((endpoint) => this.fetchData(endpoint))
        );

        this.consommations = consommations;
        this.collectes = collectes;
        this.grossistes = grossistes;
      } catch (error) {
        console.error("Erreur lors du peuplement du carrousel :", error);
      }
    },
    renderChart() {
      Highcharts.chart("container", {
        chart: {
          type: "column",
        },
        title: {
          text: "",
          align: "center",
          style: {
            fontSize: "30px",
          },
        },
        xAxis: {
          categories: ["Données des enquêtes"],
          crosshair: true,
          labels: {
            style: {
              fontSize: "16px", // Taille des étiquettes en bas du graphique
            },
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: "Nombre d'enquêtes",
          },
        },
        tooltip: {
          valueSuffix: " enquêtes",
        },
        legend: {
          itemStyle: {
            fontSize: "16px", // Taille des étiquettes des séries
            fontWeight: "bold",
          },
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0,
            dataLabels: {
              enabled: true, // Affiche le nombre sur les barres
              style: {
                fontSize: "14px", // Taille du texte des nombres sur les barres
                color: "#000", // Couleur du texte
              },
            },
          },
        },
        series: [
          {
            name: "Enquêtes sur les prix de consommation",
            data: [this.consommations.length],
          },
          {
            name: "Collectes de données",
            data: [this.collectes.length],
          },
          {
            name: "Enquêtes auprès des grossistes",
            data: [this.grossistes.length],
          },
        ],
      });
    },
  },
};
</script>

<style scoped>
.highcharts-figure,
.highcharts-data-table table {
  min-width: 310px;
  max-width: 800px;
  margin: 1em auto;
}

#container {
  height: 400px;
}

.highcharts-data-table table {
  font-family: Verdana, sans-serif;
  border-collapse: collapse;
  border: 1px solid #ebebeb;
  margin: 10px auto;
  text-align: center;
  width: 100%;
  max-width: 500px;
}

h1 {
  margin: 20px 0;
  text-align: center;
  font-size: 2.5rem; /* Augmenté pour plus de visibilité */
  color: #000;
}

.highcharts-data-table caption {
  padding: 1em 0;
  font-size: 1.2em;
  color: #555;
}

.highcharts-data-table th {
  font-weight: 600;
  padding: 0.5em;
}

.highcharts-data-table td,
.highcharts-data-table th,
.highcharts-data-table caption {
  padding: 0.5em;
}

.highcharts-data-table thead tr,
.highcharts-data-table tr:nth-child(even) {
  background: #f8f8f8;
}

.highcharts-data-table tr:hover {
  background: #f1f7ff;
}
</style>
