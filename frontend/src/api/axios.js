import axios from 'axios';

// Base URL ke XAMPP backend
const API_BASE = 'http://localhost/silaras-backend/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Penting untuk PHP Session
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor: handle error global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jangan redirect jika request gagal saat cek profil awal atau jika sudah di halaman login/register
    const isAuthCheck = error.config?.url?.includes('/auth/profile.php');
    const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';

    if (error.response?.status === 401 && !isAuthCheck && !isAuthPage) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
