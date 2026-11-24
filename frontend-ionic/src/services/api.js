import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para inyectar token Bearer si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores comunes (ej. 401 sesión caducada)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si recibimos 401 en peticiones protegidas y hay token previo, podemos limpiar credenciales
      const hadToken = !!localStorage.getItem('auth_token');
      if (hadToken && !error.config.url.includes('/auth/login')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
