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
                <th rowspan="2">Nom marché</th>
                <th>Date</th>
                <th v-for="product in filteredProducts" :key="product">
                  {{ product }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in slide.groupedMarches" :key="idx">
                <td>{{ item.nom_marche }}</td>
                <td>
                  <div
                    style="
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                    "
                  >
                    <span>{{ formatDate(item.date_enregistrement) }}</span>
                    <span>
                      {{ getDernierPrix(product, item.id_marche).date }}
                    </span>
                  </div>
                </td>
                <td v-for="product in filteredProducts" :key="product">
                  <div
                    style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                    "
                  >
                    <div
                      style="
                        display: flex;
                        flex-direction: column;
                        text-align: left;
                      "
                    >
                      <span>{{ item.prixProduit[product] || "0" }}</span>
                      <span>
                        {{
                          getDernierPrix(product, item.id_marche).prix_kg || "0"
                        }}
                      </span>
                    </div>
                    <div style="text-align: right; padding-left: 10px">
                      <span>
                        {{
                          calculateEvolution(
                            item.prixProduit[product],
                            getDernierPrix(product, item.id_marche).prix_kg
                          )
                        }}
                      </span>
                    </div>
                  </div>
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
      uniqueProducts: [],
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
    filteredProducts() {
      return this.uniqueProducts
        .filter((product) =>
          this.produitPhares.some(
            (produitPhare) => produitPhare.nom_produit === product
          )
        )
        .slice(0, 8);
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
        const regionsData = await this.fetchData(
          "http://92.112.194.154:8000/api/parametrages/localites/regions"
        );
        this.produitPhares = await this.fetchData(
          "http://92.112.194.154:8000/api/parametrages/produits/produits/les-plus-consommer"
        );

        const prefectureMap = new Map();
        prefecturesData.forEach((prefecture) => {
          prefectureMap.set(prefecture.id_prefecture, prefecture.region);
        });

        const regionMap = new Map();
        regionsData.forEach((region) => {
          regionMap.set(region.id_region, region.nom_region);
        });

        const grouped = {};
        const productsSet = new Set();

        for (const enquete of enquetesData) {
          const marche =
            enquete.enquete_relation && enquete.enquete_relation.marche
              ? marchesData.find(
                  (m) => m.id_marche === enquete.enquete_relation.marche
                )
              : null;

          const famille = famillesData.find(
            (f) =>
              f.id_famille_produit === enquete.produit_relation.famille_produit
          );

          const prefectureId = marche?.commune_relation?.prefecture;
          const regionId = prefectureMap.get(prefectureId);
          const nomRegion = regionMap.get(regionId) || "Non défini";
          const nomFamille = famille
            ? famille.nom_famille_produit
            : "Non défini";
          const nomProduit =
            enquete.produit_relation.nom_produit || "Non défini";
          const idMarche = marche?.id_marche;

          productsSet.add(nomProduit);

          if (!grouped[nomRegion]) {
            grouped[nomRegion] = {};
          }
          if (!grouped[nomRegion][nomFamille]) {
            grouped[nomRegion][nomFamille] = [];
          }

          let existingMarket = grouped[nomRegion][nomFamille].find(
            (m) => m.id_marche === idMarche
          );

          // Vérifier si le produit a une donnée valide (prix non nul)
          if (enquete.prix_fg_kg && enquete.prix_fg_kg > 0) {
            if (existingMarket) {
              existingMarket.prixProduit[nomProduit] = enquete.prix_fg_kg;
            } else {
              grouped[nomRegion][nomFamille].push({
                id_marche: idMarche,
                nom_marche: marche ? marche.nom_marche : "Non défini",
                date_enregistrement: enquete.date_enregistrement,
                prixProduit: {
                  [nomProduit]: enquete.prix_fg_kg,
                },
              });
            }
          }
        }

        // Filtrer les familles et marchés sans données de produits valides
        for (const region in grouped) {
          for (const famille in grouped[region]) {
            grouped[region][famille] = grouped[region][famille].filter(
              (marche) =>
                Object.values(marche.prixProduit).some(
                  (prix) => prix !== undefined && prix !== null && prix > 0
                )
            );

            // Si aucun marché dans la famille n'a de produits valides, supprimer la famille
            if (grouped[region][famille].length === 0) {
              delete grouped[region][famille];
            }
          }

          // Si aucune famille dans la région n'a de marchés valides, supprimer la région
          if (Object.keys(grouped[region]).length === 0) {
            delete grouped[region];
          }
        }

        this.groupedMarches = grouped;
        this.uniqueProducts = Array.from(productsSet);
      } catch (error) {
        console.error("Erreur lors du peuplement du carrousel :", error);
      }
    },
    async getDernierPrix(nomProduit, id_marche) {
      try {
        const data = await this.fetchData(
          "http://92.112.194.154:8000/api/parametrages/marches/prix-dernier/par-marche"
        );

        const marcheData = data.find(
          (marche) =>
            marche.id_marche === id_marche && marche.produit === nomProduit
        );
        console.log(marcheData);

        // Si aucune donnée n'est trouvée, retourner des valeurs par défaut
        if (!marcheData) {
          return { prix_kg: "Non défini", date: "Non défini" };
        }

        // Retourner les informations sur le prix et la date
        return {
          prix_kg: marcheData.prix_kg || "Non défini",
          date: marcheData.date_enquete || "Non défini",
        };
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du dernier prix :",
          error
        );
        return { prix_kg: "Non défini", date: "Non défini" };
      }
    },

    calculateEvolution(currentPrice, lastPrice) {
      const current = parseFloat(currentPrice) || 0;
      const last = parseFloat(lastPrice) || 0;

      if (last === 0) {
        return "0%";
      }

      const evolution = ((current - last) / last) * 100;
      return `${evolution.toFixed(2)}%`;
    },

    startCarousel() {
      const totalSlides = this.carouselSlides.length;
      const slideDuration = 5000;
      const slideWidth = 100; // Largeur de chaque slide en pourcentage

      if (totalSlides === 0) return;

      this.slideInterval = setInterval(() => {
        if (this.$refs.carousel) {
          this.currentSlide = (this.currentSlide + 1) % totalSlides;

          // Appliquer la transformation pour faire défiler le carrousel
          this.$refs.carousel.style.transform = `translateX(-${
            this.currentSlide * slideWidth
          }%)`;

          // Réinitialiser la position lorsque nous atteignons la fin
          if (this.currentSlide === 0) {
            setTimeout(() => {
              this.$refs.carousel.style.transition = "none"; // Pas de transition pour la réinitialisation
              this.$refs.carousel.style.transform = `translateX(0)`;
              // Remettre la transition après un court délai
              setTimeout(() => {
                this.$refs.carousel.style.transition = "transform 1s ease";
              }, 20); // Doit être suffisamment court pour éviter le saut visible
            }, slideDuration); // Assurez-vous que ce délai correspond à la durée du défilement
          }
        }
      }, slideDuration);
    },
  },
};
</script>

<style scoped>
.carousel-container {
  overflow: hidden;
  width: 100%;
  background-color: #fff; /* Couleur de fond du carrousel */
}

.carousel {
  display: flex;
  gap: 0px;
  transition: transform 1s ease;
  height: auto;
}

.carousel-item {
  flex: 0 0 100%;
}

.highlight {
  color: #e9bc18; /* Couleur pour les titres REGION et CATEGORIE */
}

.carousel table {
  border-collapse: collapse;
  width: 100%;
  background-color: #fff; /* Couleur de fond de la table */
  margin-top: 10px;
}
h1 {
  margin: 20px 0;
  text-align: center;
  font-size: 2.5rem;
  color: #369f4a;
}
.carousel th,
.carousel td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
}

.carousel thead {
  background-color: #369f4a;
  /* Couleur de fond des en-têtes */
}

.carousel th {
  font-weight: bold;
  color: #fff;
}

.date-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.price-evolution {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-details {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.evolution {
  text-align: right;
  padding-left: 10px;
}

.price-details span,
.evolution span {
  display: block;
}

.carousel tbody tr:nth-child(even) {
  background-color: #f9f9f9; /* Couleur de fond des lignes paires */
}
</style>
