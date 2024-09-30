// src/services/authService.js
import axios from "axios";

const API_URL =
  // "https://cors-proxy.fringe.zone/http://92.112.194.154:8000/api/login";
  "http://92.112.194.154:8000/api/login";

const username = "moh";
const password = "12345";

export async function getAccessToken() {
  try {
    const data = { username, password };
    const response = await axios.post(API_URL, data, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.data && response.data.access_token) {
      return response.data.access_token;
    } else {
      console.error("Erreur dans la réponse de l'API :", response.data);
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la requête :", error);
    return null;
  }
}
