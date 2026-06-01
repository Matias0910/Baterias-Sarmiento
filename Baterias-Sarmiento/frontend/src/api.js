import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Esta es la dirección de tu servidor FastAPI
});

export default api;