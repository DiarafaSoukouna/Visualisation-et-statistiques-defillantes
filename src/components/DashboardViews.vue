<!-- src/components/Dashboard.vue -->
<template>
  <div>
    <header>
      <img src="../assets/logo.png" alt="Logo" />
      <h1>SIM Guinée Dashboard</h1>
    </header>

    <div class="dashboard">
      <div class="welcome-card">
        <h2>Bienvenue sur SIM Guinée</h2>
        <p>
          Ce tableau de bord vous permet d'accéder rapidement aux statistiques
          des magasins, marchés, produits, et bien plus encore. Utilisez cet
          espace pour visualiser les données, suivre les performances et prendre
          des décisions éclairées.
        </p>
      </div>
      <div class="cards-container">
        <div
          v-for="(stat, index) in dataStats"
          :key="index"
          class="card"
          :style="{ animationDelay: `${index * 0.3}s` }"
          @animationend="handleAnimationEnd"
        >
          <h2>{{ stat.title }}</h2>
          <p>{{ stat.count }}</p>
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
      dataStats: [],
      redirectCountdown: 10,
    };
  },
  async mounted() {
    this.accessToken = await getAccessToken();
    if (this.accessToken) {
      this.populateDashboard();
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
    async populateDashboard() {
      try {
        const prefecturesData = await this.fetchData(
          "https://cors-proxy.fringe.zone/http://92.112.194.154:8000/api/parametrages/localites/prefectures"
        );
        const magasinsData = await this.fetchData(
          "https://cors-proxy.fringe.zone/http://92.112.194.154:8000/api/parametrages/magasins"
        );
        const marchesData = await this.fetchData(
          "https://cors-proxy.fringe.zone/http://92.112.194.154:8000/api/parametrages/marches"
        );
        const produitsData = await this.fetchData(
          "https://cors-proxy.fringe.zone/http://92.112.194.154:8000/api/parametrages/produits"
        );
        const collecteursData = await this.fetchData(
          "https://cors-proxy.fringe.zone/http://92.112.194.154:8000/api/parametrages/magasins"
        );
        const debarcaderesData = await this.fetchData(
          "https://cors-proxy.fringe.zone/http://92.112.194.154:8000/api/parametrages/debarcaderes"
        );

        this.dataStats = [
          { title: "Préfectures", count: prefecturesData.length },
          { title: "Magasins", count: magasinsData.length },
          { title: "Marchés", count: marchesData.length },
          { title: "Produits", count: produitsData.length },
          { title: "Collecteurs", count: collecteursData.length },
          { title: "Débarcadères", count: debarcaderesData.length },
        ];
      } catch (error) {
        console.error("Erreur lors du peuplement du tableau de bord :", error);
      }
    },
    // handleAnimationEnd() {
    //   const cards = document.querySelectorAll(".card");
    //   if (cards.length === this.dataStats.length) {
    //     setTimeout(() => {
    //       window.location.href = "prefectures.php"; // Change to Vue.js routing if needed
    //     }, this.redirectCountdown * 1000);
    //   }
    // },
  },
};
</script>

<style scoped>
/* Styles identiques à ceux définis dans ton fichier HTML */
body {
  margin: 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f4f4f9;
  color: #333;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

header {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #e9bc18;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

header img {
  height: 50px;
  margin-right: 20px;
}

header h1 {
  margin: 0;
  font-size: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.welcome-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
  text-align: left;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 1s forwards;
}

.welcome-card h2 {
  font-size: 1.8rem;
  margin-bottom: 10px;
  color: #369f4a;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff;
  padding: 20px;
  height: 10%;
  width: 25%;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.9);
  animation: slideIn 0.6s forwards ease-out;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.card h2 {
  font-size: 1.4rem;
  margin: 0;
  color: #369f4a;
}

.card p {
  font-size: 2.5rem;
  margin: 10px 0;
  color: #e74c3c;
  font-weight: bold;
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
