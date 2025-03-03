import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://api.neomanga.com',
  timeout: 10000,
});

instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo de errores global
    return Promise.reject(error);
  }
);

export default instance;