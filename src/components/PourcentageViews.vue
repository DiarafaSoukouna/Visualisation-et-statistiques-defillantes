<template>
  <div class="page-container">
    <h1>Produits et Prix</h1>
    <table class="data-table">
      <thead>
        <tr>
          <th>Produit</th>
          <th>Dernier Prix</th>
          <th>Pourcentage des Prix</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data" :key="index">
          <td>{{ item.produit }}</td>
          <td>{{ item.dernierPrix.toFixed(2) }} €</td>
          <td>{{ item.pourcentagePrix.toFixed(2) }} %</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: [
        { produit: "Produit A", dernierPrix: 20.5, pourcentagePrix: 10.2 },
        { produit: "Produit B", dernierPrix: 35.0, pourcentagePrix: 15.8 },
        { produit: "Produit C", dernierPrix: 12.75, pourcentagePrix: 7.4 },
        { produit: "Produit D", dernierPrix: 50.0, pourcentagePrix: 20.1 },
        // Ajoutez d'autres éléments de données si nécessaire
      ],
    };
  },
};
</script>

<style scoped>
.page-container {
  padding: 20px;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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

.data-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 15px rgba(64, 64, 64, 0.1);
  font-size: 1.2rem;
}

.data-table th,
.data-table td {
  padding: 20px;
  border: 1px solid #ddd;
  text-align: left;
}

.data-table th {
  background-color: #369f4a; /* Couleur de l'en-tête */
  color: #ffffff; /* Couleur du texte des en-têtes */
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-table td {
  background-color: #f9f9f9; /* Couleur de fond des cellules */
}

.data-table tr:nth-child(even) {
  background-color: #f8f8f8; /* Couleur des lignes paires */
}

.data-table tr:nth-child(odd) {
  background-color: #ffffff; /* Couleur des lignes impaires */
}

.data-table tr:hover {
  background-color: #e2e8f0; /* Couleur de survol */
}
</style>
