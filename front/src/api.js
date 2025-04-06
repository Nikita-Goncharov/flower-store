// src/api.js
import axios from "axios";
import store from "./redux/store";

// ВАЖЛИВО: базовий URL бекенду
// Можете задати його в .env файлі як REACT_APP_API_BASE_URL
// або прямо прописати тут, наприклад: http://localhost:8000
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

// Створюємо екземпляр axios
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Додаємо інтерсептор для додавання токена у заголовки (якщо існує)
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    if (token) {
      config.headers["token"] = token; // бекенд очікує заголовок: token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
