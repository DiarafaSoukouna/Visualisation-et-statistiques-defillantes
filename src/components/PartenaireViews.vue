<template>
  <div>
    <header>
      <img src="../assets/logo.png" alt="Logo" />
      <h1>Nos Partenaires</h1>
    </header>
    <!-- <h2 class="introduction">
      Le Système d'Information sur les Marchés de la Guinée collabore avec de
      nombreuses organisations et structures pour améliorer la qualité de ses
      services et soutenir les acteurs du secteur agricole.
    </h2> -->

    <div class="partners-container">
      <div
        v-for="(partner, index) in partners"
        :key="index"
        class="partner-card"
        :style="{ animationDelay: `${index * 0.3}s` }"
      >
        <img :src="partner.image" :alt="partner.name" class="partner-image" />
        <h2>{{ partner.name }}</h2>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      partners: [
        {
          name: "Ministère de l'Agriculture et de l'Élevage",
          image: require("../assets/magel_logo.jpeg"),
        },
        {
          name: "Programme Alimentaire Mondial (PAM)",
          image: require("../assets/wtp_logo.jpeg"),
        },
        {
          name: "Chambre Nationale d'Agriculture",
          image: require("../assets/cna_logo.jpeg"),
        },
        {
          name: "Ministère du Commerce, de l'Industrie et des PME (MCIPME)",
          image: require("../assets/armoirie_logo.png"),
        },
        {
          name: "Organisation des Nations Unies pour l'Alimentation et l'Agriculture (FAO)",
          image: require("../assets/fao_logo.png"),
        },
        {
          name: "Agence française de developpement (AFD)",
          image: require("../assets/thumbnail_image.png"),
        },
        {
          name: "SOFRECO",
          image: require("../assets/Logo SOFRECO.png"),
        },
      ],
    };
  },
};
</script>

<style scoped>
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
  background-color: #369f4a;
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
}

.introduction {
  text-align: center;
  margin: 20px;
  font-size: 1.2rem;
  color: #555;
}

.partners-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.partner-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 15%;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.95);
  animation: slideIn 0.6s forwards ease-out;
  position: relative;
  overflow: hidden;
}

.partner-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 1;
}

.partner-card:hover::before {
  opacity: 1;
}

.partner-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.partner-image {
  width: 80%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 10px;
  z-index: 2;
}

.partner-card h2 {
  font-size: 1.2rem;
  margin: 0;
  color: #333;
  position: relative;
  z-index: 2;
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
