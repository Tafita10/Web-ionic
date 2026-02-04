import axios from 'axios';

export const clientAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
});

// Intercepteur pour ajouter automatiquement le token à toutes les requêtes
clientAPI.interceptors.request.use(
  (config) => {
    const jeton = localStorage.getItem('jeton');
    if (jeton) {
      config.headers.Authorization = `Bearer ${jeton}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs d'authentification et rafraîchir le token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

clientAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et on n'a pas déjà tenté de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Attendre que le refresh en cours se termine
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return clientAPI(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('jetonRefresh');
      
      if (!refreshToken) {
        // Pas de refresh token, déconnecter
        localStorage.removeItem('jeton');
        localStorage.removeItem('jetonRefresh');
        localStorage.removeItem('utilisateur');
        window.location.reload();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/refresh`,
          { refresh_token: refreshToken }
        );
        
        localStorage.setItem('jeton', data.jetonAcces);
        clientAPI.defaults.headers.common['Authorization'] = `Bearer ${data.jetonAcces}`;
        originalRequest.headers.Authorization = `Bearer ${data.jetonAcces}`;
        
        processQueue(null, data.jetonAcces);
        isRefreshing = false;
        
        return clientAPI(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Échec du refresh, déconnecter
        localStorage.removeItem('jeton');
        localStorage.removeItem('jetonRefresh');
        localStorage.removeItem('utilisateur');
        window.location.reload();
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
