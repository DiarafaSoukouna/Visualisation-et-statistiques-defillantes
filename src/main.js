// src/main.js

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router"; // Importation du router configuré

// Crée l'application Vue et utilise le router
const app = createApp(App);

app.use(router); // Ajoute le router à l'application Vue
app.mount("#app"); // Monte l'application sur l'élément avec l'ID "app"
