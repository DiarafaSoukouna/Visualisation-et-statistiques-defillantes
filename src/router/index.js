// src/router/index.js

import { createRouter, createWebHistory } from "vue-router"; // Pour Vue 3

import HomeView from "../components/HelloWorld.vue";
import Dashboard from "../components/DashboardViews.vue";
import Prefectures from "../components/PrefectureViews.vue";
import rapport from "../views/rapportCarousel.vue";
import Produits from "../components/ProduitViews.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
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
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL), // Utiliser createWebHashHistory() si tu veux des URLs avec hash
  routes,
});

export default router;
