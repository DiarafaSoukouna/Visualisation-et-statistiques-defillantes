// src/router/index.js

import { createRouter, createWebHistory } from "vue-router"; // Pour Vue 3

import HomeView from "../components/HelloWorld.vue";
import Dashboard from "../components/DashboardViews.vue";
import Prefectures from "../components/PrefectureViews.vue";
import rapport from "../views/rapportCarousel.vue";
import Produits from "../components/ProduitViews.vue";
import Marche from "../components/MarcheViews.vue";
import Magasin from "../components/MagasinViews.vue";
import Evolution from "../components/EvolutionViews.vue";
import Pourcentage from "../components/PourcentageViews.vue";
import Tableau from "../components/tableau.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: Dashboard,
  },
  {
    path: "/prefecture",
    name: "Prefecture",
    component: Prefectures,
  },
  {
    path: "/rapport",
    name: "rapport",
    component: rapport,
  },
  {
    path: "/produit",
    name: "produit",
    component: Produits,
  },
  {
    path: "/marche",
    name: "marche",
    component: Marche,
  },
  {
    path: "/magasin",
    name: "magasin",
    component: Magasin,
  },
  {
    path: "/evolution",
    name: "evolution",
    component: Evolution,
  },
  {
    path: "/pourcentage",
    name: "Pourcentage",
    component: Pourcentage,
  },
  {
    path: "/tableau",
    name: "tableau",
    component: Tableau,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL), // Utiliser createWebHashHistory() si tu veux des URLs avec hash
  routes,
});

export default router;
